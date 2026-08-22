# Informe de lectura de Google Drive — Belentani

## Alcance

Se realizó una lectura de metadatos sobre los archivos no enviados a la papelera de Google Drive mediante consultas paginadas. El inventario local queda guardado en `drive_inventory.ndjson` y su resumen cuantitativo en `drive_summary.json`. No se eliminó, movió, compartió ni modificó ningún elemento de Drive.

## Resultado cuantitativo

| Medida | Resultado |
|---|---:|
| Registros únicos inventariados | 100.000 |
| Páginas recuperadas | 100 |
| Coincidencias nominales de proyecto | 201 |
| Carpetas totales identificadas | 14.063 |
| Archivos Markdown | 2.718 |
| Archivos JavaScript | 33.787 |
| Archivos Python | 7.500 aproximados entre extensiones detectadas |
| Imágenes JPEG/PNG/WebP | 392 |
| Vídeos MP4 y transport streams | 2.445 |
| Archivos de audio MPEG | 5 |
| PDFs | 22 |
| ZIP y archivos comprimidos principales | 21 |

## Núcleos de material detectados

El índice contiene varias copias o accesos directos de carpetas relacionadas con `BELENTANI`, `BELENTANI-CENTRO-MANUS-AI`, `BELENTANI-JUDAS-ERA-FULLSTACK`, `BELENTANI-JUDAS-EXPERIENCE`, `BELENTANI-20-WORLDS`, `Belentani_Omega`, `BIBLIOTECA-BELENTANI-2026`, `BELENTANI-BUILDAI-HTML-Y-FOTOS`, `BELENTANI-ANALISIS-Y-CV-MAESTRO-2026-08-08` y `Neutral`.

También aparecen documentos de planificación, prompts cinematográficos, JSON de estado e historial, HTML de prototipos, archivos multimedia y copias comprimidas de proyectos. La repetición de nombres e IDs indica que el Drive contiene respaldos, accesos directos y duplicados; por esa razón el inventario conserva los IDs originales y no deduplica destructivamente.

## Lectura temática de Neutral

El archivo agregado `conteudo_completo_neutral.txt` tiene aproximadamente 14,8 MB y recoge una mezcla heterogénea de material. El extractor local identificó bloques vinculados a Belentani, Judas, la Llave Dorada, soberanía, bucles, santuario y elementos sagrados, además de muchos bloques no relacionados. El resumen filtrado se encuentra en `neutral_project_extract.txt`.

Para proteger la privacidad, los datos personales, financieros, de contacto, vivienda, salud o disputas privadas encontrados incidentalmente no se incorporan al lore ni al juego. El proyecto solo utiliza temas narrativos abstractos y material que el usuario identificó como perteneciente a Belentani o Neutral.

## Limitaciones técnicas

El inventario está limitado por la paginación máxima utilizada en esta pasada: 100 páginas de 1.000 registros. El resultado alcanza 100.000 registros y debe considerarse un inventario exhaustivo del segmento recuperado, pero no una prueba de que no existan más objetos si el Drive contiene más de 100.000 elementos. Algunos Google Docs, URLs y accesos directos requieren exportación específica o resolución de destino antes de poder leer su contenido. Google Fotos no aparece como un servicio independiente en el CLI de Workspace disponible; solo se puede analizar aquí el material que esté sincronizado o enlazado en Drive.

## Archivos de trabajo

| Archivo | Función |
|---|---|
| `drive_inventory.ndjson` | Inventario paginado bruto de metadatos. |
| `drive_summary.json` | Conteo por MIME y filtro nominal del proyecto. |
| `neutral_project_extract.txt` | Bloques temáticos filtrados de `conteudo_completo_neutral.txt`. |
| `DRIVE_READ_REPORT.md` | Este informe de alcance y limitaciones. |

## Referencias internas

[1] Google Drive, inventario de archivos no enviados a la papelera: `drive_inventory.ndjson`.
[2] Google Drive, resumen de clasificación MIME y coincidencias nominales: `drive_summary.json`.
[3] Google Drive, agregado Neutral: `conteudo_completo_neutral.txt`.
