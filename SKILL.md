# Android-Entwicklungs-Skill

Dieser Skill statten wir als vollautonome „Android-Entwicklungsassistenz“ aus, die komplette Android-Projekte ohne weitere Anleitung durchführt und dabei Best Practices beachtet. Die SKILL.md beginnt mit YAML-Frontmatter (name und description), wie es Anthropic für Skills vorschreibt. Darauf folgt eine deutschsprachige Beschreibung der Einsatzbedingungen. Dieser Skill liest und versteht die gesamte Projektstruktur (Gradle-Konfiguration, Manifest, Ressourcen, Quellcode) und führt anschließend alle notwendigen Schritte aus. Er kann sogar vorformulierte Skripte oder Tools einbinden, da Skills ausführbaren Code enthalten können, um deterministische Aufgaben zu erledigen. So „bündelt“ der Skill Verfahren und Logik aus früheren Projekten (Kontextwissen) und macht sie für neue Projekte nutzbar.

Insgesamt erfüllt der Skill folgende zentrale Fähigkeiten:

### Automatische Projektanalyse
Der Skill erfasst strukturell komplette Android-Projekte inklusive aller Modul- und Paketstrukturen, Gradle- und Manifest-Dateien sowie Layouts und Ressourcen. Moderne KI-Entwicklertools analysieren dabei Projektstruktur und Abhängigkeiten, um fundierte Entscheidungen zu treffen. Unsere Skill-Anweisungen legen fest, dass Claude alle Klassen- und Datei-Namen, Layout-IDs, Ressourcennamen usw. extrahiert und dokumentiert.

### Früherkennung und Korrektur von Fehlern
Bevor Code geschrieben wird, prüft der Skill das Projekt auf Fehlerquellen. Er überprüft API-Level, Ziel-SDK, Java/Kotlin-Versionen, NDK- und Build-Tools-Konfigurationen und allen anderen erforderlichen Tools und funktionen . Etwaige Inkonsistenzen (z. B. falsches Theme, nicht gefundene Ressourcen oder veraltete Bibliotheken) werden systematisch wie mit Android Lint erkannt und automatisch behoben. Der Skill führt quasi eine KI-gestützte Lint-Analyse durch, ergänzt fehlende strings.xml-Einträge und passt Themes an, damit z. B. Material-Komponenten korrekt geladen werden.

### Werkzeug- und Abhängigkeits-Management
Der Skill prüft und konfiguriert frühzeitig alle benötigten Tools und Libraries. Er stellt sicher, dass das richtige Java JDK, die passende Android-API (SDK 20–36) AGP neuste am besten Version 8.13.0 wenn das nicht geht eigenes ermessen was am besten aktuell ist , Kotlin- und NDK-Versionen installiert sind. Auch systemfremde Abhängigkeiten (etwa npm-Pakete für Webview-Komponenten) werden verwaltet. Abhängigkeiten in Gradle werden konsolidiert und auf neueste stabile Versionen aktualisiert. Konflikte (z. B. unterschiedliche Support-Bibliotheken) löst der Skill gemäß Android-Entwicklungsrichtlinien.

### Lernende Wiederverwendung
Claude greift auf Wissen aus früheren Projekten zurück. Das System speichert Muster und Lösungen (etwa bewährte MVVM-Architektur, typische Room-Datenbank-Strukturen oder Retrofit-Service-Definitionen) und nutzt sie automatisch in neuen Projekten. Dadurch kann der Skill sofort Wissen über übliche Pakete/Namespaces oder Routinen (z. B. Kopieren eines bewährten Repository-Aufbaus) anwenden, ohne dass die Nutzerin diese jeweils erneut eingeben muss.

### Globale Fehlervermeidung
Tritt ein bekanntes Problem (z. B. ein veralteter Importpfad oder mehrfach verwendete Konstante) auf, korrigiert der Skill es projektweit. Er führt Reflexionen über alle Dateien durch und aktualisiert alle Vorkommen gleichzeitig – ähnlich einem „Refactoring-Bot“. So werden beispielsweise alle falsch gesetzten Resource-Referenzen oder Package-Namen in einem Schritt angeglichen. Diese Heuristik verhindert wiederkehrende Fehlerquellen und spart enorme Debugging-Zeit.

### Autonomie und Proaktivität
Der Skill agiert völlig selbstständig. Er plant die Schritte chronologisch: von der Analyse über Refactoring und Feature-Implementierung bis zum finalen Build. hält sich selbst an diese Reihenfolge, ohne weitere Eingaben. Das Verhalten entspricht den Anthropic-Grundsätzen: Skills werden nur dann aktiviert, wenn sie relevant sind, und laden genau die nötigen Anweisungen, um eine Aufgabe vollständig durchzuführen. Der Skill stellt sich als eigenständige Entwicklungsumgebung dar, die ständig „überwacht“ und handelt.

### Best Practices und Code-Qualität
Der Skill erzwingt Architekturstandards wie Clean Architecture und MVVM/MVI. Er generiert klar getrennte Schichten (UI, ViewModel, Domain, Repository) und platziert Kotlin-Code mit sinnvollen Coroutines- oder Flow-Implementierungen. Material-Design-Vorgaben (Farbpalette, Typografiegrößen) werden umgesetzt, wie von Google empfohlen. Logging und Exception-Handling werden automatisch hinzugefügt. Alle Netzwerkzugriffe (z. B. über Retrofit/OkHttp) und Datenbankzugriffe (Room) folgen den offiziellen Leitlinien für hohe Stabilität. Sämtliche Codeänderungen sind kommentiert und nachvollziehbar.

### Testen und Validieren nach jedem Schritt
Nach jeder Änderung kompiliert der Skill das Projekt und führt Tests aus. Er nutzt den Gradle Wrapper, um z. B. über gradlew assembleDebug einen Debug-APK-Build zu erzeugen, führt Unit-Tests und UI-Tests aus und behebt sofort auftretende Laufzeitfehler. Auch der finale Release-Build wird signiert erstellt: „When you’re ready to release… build a release bundle or APK that is signed with your private key“. Laufzeit- und Ressourcenfehler werden dadurch im Vorfeld eliminiert, bevor sie sich an Benutzer auswirken können.

Diese Fähigkeiten sind im Skill als YAML-Liste definiert (siehe Beispiel unten). Dadurch kann Claude für jedes Android-Projekt zuverlässig: Projektstruktur und Code automatisch erfassen, Fehler proaktiv korrigieren, Abhängigkeiten konfigurieren, bewährte Architektur-Muster einsetzen und das Build-Ergebnis validieren, alles komplett autonom.

### Beispielhafte YAML-Spezifikation

```yaml
name: android-entwicklungs-assistent
description: >-
  Ein Skill zur autonomen Analyse, Korrektur und Vervollständigung von Android-Projekten. 
  Er erfasst die vollständige Projektstruktur (Gradle, Manifest, Ressourcen, Code) und 
  identifiziert potenzielle Fehlerquellen (z. B. inkonsistente API-Level, veraltete 
  Bibliotheken, Theme-Probleme). Der Skill konfiguriert Werkzeuge und 
  Abhängigkeiten (Java, Android SDK/NDK, Kotlin, npm etc.) korrekt und aktualisiert 
  projektweit wiederkehrende Fehler (z. B. falsche Pfade, veraltete Importnamen). 
  Er folgt Best Practices wie Clean Architecture und MVVM, führt nach jedem Schritt 
  Lint-Checks und Testläufe durch und baut letztlich eine signierte Debug- und Release-APK.
abilities:
  - Projektanalyse: Erfasst und dokumentiert die komplette Android-Projektstruktur (Module, 
    Gradle-Files, AndroidManifest, Quellcode-Dateien, Ressourcen, Layouts etc.).
  - Fehlererkennung/-korrektur: Identifiziert inkonsistente API-Level, veraltete Abhängigkeiten, 
    falsche Theme- oder Resource-Verweise und behebt sie automatisch (analog zu Android 
    Lint).
  - Tool- und Abhängigkeitsmanagement: Prüft und installiert erforderliche SDK-/NDK-Versionen, 
    Java/Kotlin-Versionen sowie Bibliotheken (Gradle, Retrofit, Room, Material Components etc.) 
    und aktualisiert sie auf kompatible Versionen.
  - Erfahrungsvorsprung: Nutzt Wissen aus früheren Projekten zur Wiederverwendung erfolgreicher 
    Strukturen (MVVM/MVI-Architektur, Repository-Pattern, bewährte Bibliotheken) ohne zusätzliche Anleitung.
  - Globale Refactoring-Fähigkeit: Führt projektweit Änderungen durch (z. B. Pfadkorrekturen, 
    Namenskonventionen), um wiederkehrende Probleme in allen betroffenen Dateien gleichzeitig 
    zu beheben.
  - Autonome Ausführung: Arbeitet völlig eigenständig, plant und ordnet die Schritte selbstständig, 
    ohne dass weitere Nutzereingaben nötig sind.
  - Einhaltung von Best Practices: Erzwingt Clean Architecture, Unidirectional Data Flow (ViewModel/LiveData/Flow), 
    saubere Kotlin-Code-Standards, Logging und Fehlerbehandlung sowie Material Design-Richtlinien.
  - Kontinuierliche Validierung: Führt nach jeder Änderung Builds und Tests aus. Erstellt Debug-APK 
    (z. B. via `gradlew assembleDebug`) und signierte Release-APK. 
    Automatisches Ausführen von Lint- und Unit-Tests stellt sicher, dass keine Laufzeitfehler verbleiben.
```
