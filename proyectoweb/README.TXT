El código QR lo puedes crear de la siguiente forma:

    <div id="qrcode" class="qr">
    <script src="/static/javascript/script.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" integrity="sha512-CNgIRecGo7nphbeZ04Sc13ka07paqdeTu0WR1IM4kNcpmBAUSHSQX0FslNhTDadL4O5SAGapGt4FodqL8My0mA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script type="text/javascript">
        new QRCode(document.getElementById("qrcode"), "{{ url_servidor }}");
    </script>

En el div con el id "qrcode", se agregará una imagen con un Código QR que será creado
por el javascript QRCode de la biblioteca qrcode.min.js

El QR debe ser creado usando la variable "url_servidor" que viene desde el archivo
promo.py y que contiene la URL de la página promocional en su versión para
dispositivos móviles.

Lo que recomiendo es compartir la Internet del celular al pc, para que queden ambos
en la misma subred y poner la IP del pc como dirección del servidor.
