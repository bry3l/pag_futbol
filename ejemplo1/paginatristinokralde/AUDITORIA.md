# Auditoría WCAG 2.2 AA, UX y responsive

## Resumen ejecutivo

La revisión inicial encontró un desbordamiento horizontal confirmado en `320px`, contraste insuficiente en varios textos, objetivos táctiles pequeños en la navegación y una relación ARIA incompleta entre pestañas y paneles. Se corrigieron esos puntos en `index.html`, `styles.css` y `script.js` sin cambiar la identidad visual ni el contenido editorial.

La estructura semántica, la jerarquía de encabezados, los textos alternativos y la interacción básica de la línea de tiempo ya eran adecuados. La validación posterior confirmó que no hay errores del editor, que el JavaScript responde al teclado y que no hay overflow en `320px`, `390px`, `768px` ni `1440px`.

## Hallazgos críticos

No se encontraron hallazgos críticos justificados por el código auditado.

## Hallazgos altos

### H-01. Reflow y overflow horizontal en 320px

- **Criterio:** WCAG 2.2, 1.4.10 Reflow.
- **Evidencia inicial:** en `styles.css`, los tamaños mínimos de `h1` y de `.section-heading h2` hacían que `Ronaldo` y un título de sección superaran el ancho útil. El navegador informó `scrollWidth: 339px` frente a `305px` disponibles y señaló el `em` del `h1` y un `span` de título como desbordados.
- **Corrección aplicada:** en la media query de móvil se añadieron tamaños fluidos menores para `h1` y `.section-heading h2`.
- **Estado:** corregido en código y verificado en navegador: `scrollWidth` coincide con el ancho útil en `320px`, `390px`, `768px` y `1440px`.

## Hallazgos medios

### M-01. Contraste de texto insuficiente

- **Criterio:** WCAG 2.2, 1.4.3 Contraste mínimo.
- **Evidencia inicial:** `styles.css` usaba `--red: #d94c36`, texto melocotón sobre rojo en `.hero .eyebrow` y `.hero-description`, y texto atenuado en `.era-panel` y `.interaction-status`. Esas combinaciones eran de riesgo para texto normal y pequeño.
- **Corrección aplicada:** se oscureció el rojo a `#b83b2c`, se ajustó `--red-dark`, se aclararon `--gold` y `--muted`, y los textos pequeños sobre fondos rojo/oscuro pasaron a colores claros de mayor contraste.
- **Estado:** corregido en CSS; queda pendiente confirmar los ratios finales con axe, Lighthouse o un analizador WCAG en el navegador, especialmente en estados hover/focus y sobre las imágenes.

### M-02. Objetivos táctiles pequeños en la navegación

- **Criterio:** WCAG 2.2, 2.5.8 Tamaño del objetivo (mínimo).
- **Evidencia inicial:** `.main-nav a` medía aproximadamente `16px` en móvil y `19px` en escritorio, sin área de interacción suficiente.
- **Corrección aplicada:** `.main-nav a` ahora usa `display: inline-flex`, `min-height: 24px` y padding vertical.
- **Estado:** corregido en CSS y verificado en navegador: los enlaces miden `24px` o más en los anchos auditados. Falta probar la facilidad de pulsación en un dispositivo táctil real.

### M-03. Paneles de pestañas sin nombre explícito relacionado

- **Criterio:** robustez ARIA y patrón de pestañas WAI-ARIA.
- **Evidencia inicial:** los botones tenían `aria-controls`, pero los `article[role="tabpanel"]` no tenían `aria-labelledby` ni los botones tenían `id`.
- **Corrección aplicada:** se añadieron IDs `tab-2003`, `tab-2009`, `tab-2018` y `tab-2023`, y cada panel declara el `aria-labelledby` correspondiente.
- **Estado:** corregido en HTML y comprobado en el árbol de accesibilidad del navegador: el panel activo expone el nombre de su pestaña.

## Hallazgos bajos

### L-01. Carga de imágenes externas y lazy loading

- **Evidencia:** las imágenes de galería usan URLs externas de Wikimedia Commons y `loading="lazy"`. En una inspección inmediata antes de entrar en viewport, algunas imágenes todavía tenían `naturalWidth: 0`, comportamiento compatible con lazy loading, no necesariamente con una ruta rota.
- **Recomendación:** verificar manualmente la galería desplazándose hasta ella y revisar también el comportamiento sin conexión o con las imágenes bloqueadas.
- **Estado:** pendiente de prueba manual completa de carga visual de las tres imágenes.

### L-02. Anuncios potencialmente duplicados para lectores de pantalla

- **Evidencia:** `.timeline-detail` tiene `aria-live="polite"` y `#timeline-status` tiene `role="status"`; al cambiar una pestaña pueden anunciarse tanto el panel como el estado.
- **Recomendación:** probar con un lector de pantalla. Si se repite el anuncio, conservar un único canal de actualización.
- **Estado:** pendiente de prueba manual con lector de pantalla; no se ha modificado porque el comportamiento depende de la combinación de navegador y tecnología de asistencia.

## Criterios que se cumplen

- **Estructura semántica:** existen `header`, `nav`, `main`, `section`, `article`, `figure`, `figcaption` y `footer`.
- **Jerarquía:** hay un `h1`, encabezados de sección `h2` y títulos de panel `h3`, sin saltos estructurales evidentes.
- **Nombres accesibles:** la navegación tiene `aria-label`; la imagen de fondo del héroe tiene `role="img"` y `aria-label`; los enlaces y botones tienen texto visible.
- **Textos alternativos:** las tres imágenes de galería tienen `alt` descriptivo y no vacío.
- **Botones y enlaces:** los controles de la línea de tiempo son `button`; las acciones de navegación son enlaces con destinos internos o externos.
- **Foco:** existe una regla global `:focus-visible` con contorno de `3px` y el skip link se revela al recibir foco.
- **Teclado:** los botones responden de forma nativa a Enter/Espacio; JavaScript añade flechas, Home y End. Se verificó `ArrowRight`: mueve el foco, actualiza `aria-selected`, muestra el panel correspondiente y actualiza el estado.
- **JavaScript:** `script.js` no tiene errores reportados por el editor y su sintaxis fue validada con `node --check`.
- **Responsive probado:** no se detectó overflow horizontal en `320px`, `390px`, `768px` ni `1440px` después de la corrección.

## Pruebas que deberían repetirse después de corregir

1. Ejecutar axe, Lighthouse o una herramienta equivalente para confirmar ratios de contraste y detectar problemas ARIA adicionales.
2. Abrir la página en un navegador real a `320px`, `390px`, `768px` y escritorio; revisar visualmente texto, foco, navegación y ausencia de desplazamiento horizontal.
3. Recorrer la página solo con Tab, Enter, Espacio, flechas, Home y End.
4. Desplazarse hasta la galería y confirmar que las tres imágenes cargan, conservan su composición y no generan saltos molestos.
5. Probar la línea de tiempo con NVDA, VoiceOver o TalkBack para confirmar que no hay anuncios duplicados.
6. Probar enlaces externos, estados hover/focus y pulsación táctil en un dispositivo físico.
