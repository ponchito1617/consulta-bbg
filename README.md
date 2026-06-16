# Consulta BBG

## Estado del despliegue
La aplicación ya está desplegada en Cloud Run y funciona correctamente.

## Dominio personalizado
Para agregar un dominio personalizado, sigue estos pasos en Google Cloud:

1. Ve a Cloud Run:
   - https://console.cloud.google.com/run?project=consulta-bbg
2. Selecciona el servicio `consulta-bbg`.
3. Haz clic en `Asignaciones de dominios`.
4. Agrega tu dominio personalizado.
5. Sigue las instrucciones para validar el dominio y actualizar tu DNS con los registros proporcionados por Google.

> Nota: necesitas acceso a la configuración DNS de tu dominio.

## Actualización de datos (`data.json`)
Cuando necesites actualizar los datos de consulta, sigue estos pasos:

1. Reemplaza el archivo `data/data.json` con los nuevos datos.
2. Haz commit y push al repositorio:

```bash
cd "c:\Users\ponch\Documents\ConsultaBBG"
git add data/data.json
git commit -m "Actualizar data.json"
git push origin main
```

3. Cloud Build detectará el cambio y desplegará la nueva versión automáticamente.

## Comandos para actualizar únicamente `data.json`

```bash
cd "c:\Users\ponch\Documents\ConsultaBBG"
git pull origin main
# Reemplaza el archivo data/data.json localmente
git add data/data.json
git commit -m "Actualizar data.json"
git push origin main
```

### Si deseas verificar que el build se activó

1. Ve a Cloud Build Builds:
   - https://console.cloud.google.com/cloud-build/builds?project=consulta-bbg
2. Verifica el estado del build más reciente.

## Consejo
Para que el dominio personalizado quede bien, usa HTTPS y espera que el DNS se propague.
