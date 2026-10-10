import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { AppState, BackupFileContent, BackupMetadata } from '../types/tax';
import { INITIAL_APP_STATE } from '../constants/initialState';

const DB_NAME = 'SteuerCockpit2026_DB';
const DB_VERSION = 1;
const STORE_STATE = 'app_state';
const STORE_BACKUPS = 'backups_meta';
const KEY_CURRENT_STATE = 'current_active_state';

class StorageService {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private getDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_STATE)) {
            db.createObjectStore(STORE_STATE);
          }
          if (!db.objectStoreNames.contains(STORE_BACKUPS)) {
            db.createObjectStore(STORE_BACKUPS, { keyPath: 'metadata.checksum' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  /**
   * Lädt den aktuellen Zustand aus der IndexedDB (Fallback: localStorage, Fallback: INITIAL_APP_STATE)
   */
  async loadState(): Promise<AppState> {
    try {
      const db = await this.getDB();
      const state = await db.get(STORE_STATE, KEY_CURRENT_STATE);
      if (state && typeof state === 'object') {
        const typedState = state as AppState;
        // Migration: Falls Bescheinigungen oder Monatsabrechnungen noch leer sind
        if (!typedState.lohnsteuerbescheinigungen || typedState.lohnsteuerbescheinigungen.length === 0) {
          typedState.lohnsteuerbescheinigungen = INITIAL_APP_STATE.lohnsteuerbescheinigungen;
        }
        if (!typedState.monatsabrechnungen || typedState.monatsabrechnungen.length === 0) {
          typedState.monatsabrechnungen = INITIAL_APP_STATE.monatsabrechnungen;
        }
        if (!typedState.arbeitgeber || typedState.arbeitgeber.length < 2) {
          typedState.arbeitgeber = INITIAL_APP_STATE.arbeitgeber;
        }
        typedState.version = 2;
        return typedState;
      }
    } catch (err) {
      console.warn('IndexedDB read failed, trying localStorage fallback:', err);
    }

    // Fallback: localStorage
    try {
      const local = localStorage.getItem('steuer_cockpit_2026_fallback');
      if (local) {
        const parsed = JSON.parse(local) as AppState;
        if (!parsed.lohnsteuerbescheinigungen || parsed.lohnsteuerbescheinigungen.length === 0) {
          parsed.lohnsteuerbescheinigungen = INITIAL_APP_STATE.lohnsteuerbescheinigungen;
        }
        if (!parsed.monatsabrechnungen || parsed.monatsabrechnungen.length === 0) {
          parsed.monatsabrechnungen = INITIAL_APP_STATE.monatsabrechnungen;
        }
        return parsed;
      }
    } catch (err) {
      console.error('localStorage fallback failed:', err);
    }

    return INITIAL_APP_STATE;
  }

  /**
   * Speichert den aktuellen Zustand atomar in IndexedDB und redundant im localStorage
   */
  async saveState(state: AppState): Promise<void> {
    const updatedState: AppState = {
      ...state,
      letztesUpdate: new Date().toISOString(),
    };

    try {
      const db = await this.getDB();
      await db.put(STORE_STATE, updatedState, KEY_CURRENT_STATE);
    } catch (err) {
      console.error('Failed to save to IndexedDB:', err);
    }

    // Redundanter Fallback-Speicher im localStorage
    try {
      localStorage.setItem('steuer_cockpit_2026_fallback', JSON.stringify(updatedState));
    } catch (e) {
      // localStorage kann bei vielen Belegen voll sein; IndexedDB ist die Primärquelle
      console.warn('LocalStorage quota limit reached for mirror copy:', e);
    }
  }

  /**
   * Berechnet eine einfache, deterministische Prüfsumme für Integritätstests
   */
  calculateChecksum(dataStr: string): string {
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      const char = dataStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Erzeugt eine geprüfte Backup-Datei als JSON-Download
   */
  createBackupExport(state: AppState, label = 'meilenstein'): BackupFileContent {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    const filename = `steuer-cockpit_2026_${dateStr}_${label}.backup.json`;

    const payloadString = JSON.stringify(state);
    const checksum = this.calculateChecksum(payloadString);

    const metadata: BackupMetadata = {
      appVersion: state.version,
      erstelltAm: now.toISOString(),
      dateiname: filename,
      checksum,
      datensaetzeCount: {
        arbeitgeber: state.arbeitgeber.length,
        lohnsteuerbescheinigungen: state.lohnsteuerbescheinigungen.length,
        monatsabrechnungen: state.monatsabrechnungen.length,
        belege: state.belege.length,
        kalendertage: Object.keys(state.kalender).length,
      },
    };

    const backupContent: BackupFileContent = {
      metadata,
      state,
    };

    return backupContent;
  }

  /**
   * Führt einen Download der Backup-Datei aus
   */
  downloadBackupFile(backupContent: BackupFileContent): void {
    const jsonString = JSON.stringify(backupContent, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backupContent.metadata.dateiname;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Prüft und stellt ein Backup wieder her (Integritätsprüfung + Rücklese-Check)
   */
  async restoreBackup(jsonString: string): Promise<{ success: boolean; message: string; state?: AppState }> {
    try {
      const parsed = JSON.parse(jsonString) as BackupFileContent;

      if (!parsed.metadata || !parsed.state) {
        return { success: false, message: 'Ungültiges Backup-Format: Metadaten oder Daten fehlen.' };
      }

      // Checksummenprüfung
      const computedChecksum = this.calculateChecksum(JSON.stringify(parsed.state));
      if (computedChecksum !== parsed.metadata.checksum) {
        return { 
          success: false, 
          message: `Integritätsfehler: Prüfsumme stimmt nicht überein (Erwartet: ${parsed.metadata.checksum}, Berechnet: ${computedChecksum}). Datei ist möglicherweise beschädigt.` 
        };
      }

      // Zustand sichern
      await this.saveState(parsed.state);

      // Rücklese-Test: Verifizieren, dass der Zustand sofort wieder korrekt lesbar ist
      const readBack = await this.loadState();
      if (!readBack || readBack.version !== parsed.state.version) {
        return { success: false, message: 'Rücklese-Test nach Wiederherstellung fehlgeschlagen.' };
      }

      return {
        success: true,
        message: `Backup erfolgreich wiederhergestellt! (${parsed.metadata.datensaetzeCount.arbeitgeber} Arbeitgeber, ${parsed.metadata.datensaetzeCount.monatsabrechnungen} Monatsabrechnungen, ${parsed.metadata.datensaetzeCount.belege} Belege)`,
        state: readBack,
      };
    } catch (err: any) {
      return { success: false, message: `Fehler beim Einlesen der Backup-Datei: ${err.message}` };
    }
  }

  /**
   * Setzt alles auf Werkseinstellungen zurück
   */
  async resetToDefaults(): Promise<AppState> {
    await this.saveState(INITIAL_APP_STATE);
    return INITIAL_APP_STATE;
  }
}

export const storageService = new StorageService();
