# Archivos de Audio para Notificaciones

Este directorio debe contener los archivos de audio para las notificaciones push.

## Archivos Requeridos:

### `notification-sound.mp3`
- **Uso**: Sonido principal para notificaciones generales
- **Duración recomendada**: 1-2 segundos
- **Volumen**: Moderado (se ajusta programáticamente al 30%)

### `success-sound.mp3`
- **Uso**: Sonido para notificaciones de éxito (compras, pagos)
- **Características**: Sonido positivo, uplifting

### `warning-sound.mp3`
- **Uso**: Sonido para alertas y advertencias (stock bajo, errores)
- **Características**: Sonido de atención pero no intrusivo

### `error-sound.mp3`
- **Uso**: Sonido para errores críticos
- **Características**: Sonido distintivo para errores

## Formato Recomendado:
- **Formato**: MP3
- **Sample Rate**: 44.1kHz
- **Bitrate**: 128kbps
- **Canales**: Estéreo o mono

## Fuentes de Audio Gratuitas:
- [Freesound.org](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [Notification Sounds](https://notificationsounds.com/)

## Nota:
Los archivos de audio son opcionales. Si no están presentes, las notificaciones funcionarán silenciosamente.
