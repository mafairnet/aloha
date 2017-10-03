var wavesurfer;

$(document).ready(function(){

    wavesurfer = Object.create(WaveSurfer);

    wavesurfer = WaveSurfer.create({
      container: document.querySelector('#waveForm'),
      waveColor: '#337ab7',//'#A8DBA8',
      progressColor: '#88b7dd', //'#3B8686',
      height: 70,
      cursorColor: '#0077cf',
      //backend: 'MediaElement'
   });

   $('#footer-bar').hide();
   

   var currentDate = new Date();

   wavesurfer.on('ready', function () {
      $('#divMessageError').hide();
      var timeline = Object.create(WaveSurfer.Timeline);

      timeline.init({
         wavesurfer: wavesurfer,
         container: '#waveForm-timeline'
      });
      
      wavesurfer.playPause();
      $("#btnPlayPause").find('i').attr('class', 'glyphicon glyphicon-pause');
   });
      
   wavesurfer.on('finish', function () {
      $("#btnPlayPause").find('i').attr('class', 'glyphicon glyphicon-play');
      $('#footer-bar').hide();
   });
   
   wavesurfer.on('error', function (e) {
      $("#btnPlayPause").find('i').attr('class', 'glyphicon glyphicon-play');
      $('#footer-bar').hide();
      $('#divMessageError').show();
      $('#divMessageError span').html("Error al reproducir: " + e);
   });

   wavesurfer.setVolume(0.6);
   $('#volumeRange').val(wavesurfer.backend.getVolume());   

   var volumeInput = document.querySelector('#volumeRange');
   var onChangeVolume = function (e) {
      wavesurfer.setVolume(e.target.value);
      console.log(e.target.value);
   };
   volumeInput.addEventListener('input', onChangeVolume);
   volumeInput.addEventListener('change', onChangeVolume);


   $("#btnPlayPause").click(function () {
      wavesurfer.playPause();
      $(this).find('i').toggleClass('glyphicon glyphicon-pause').toggleClass('glyphicon glyphicon-play');
   });

    

});

function playAudio(url,file) {   
   $('#footer-bar').show();
   wavesurfer.load(url + file );
   console.log(url+file);
   wavesurfer.setVolume($('#volumeRange').val());
   $('#waveForm-control span').html("&nbsp&nbsp&nbsp Now Playing: " + file);
}

function stopAudio()
{
    wavesurfer.stop();
    $('#footer-bar').hide();
}

function getAudio(date, file, url, id) {
   downloadElement("Recording_" + id + ".wav", url + file);
}

function downloadElement(filename, target) {
   var element = document.createElement('a');
   element.setAttribute('href', target);
   element.setAttribute('download', filename);
   element.style.display = 'none';
   document.body.appendChild(element);
   element.click();
   document.body.removeChild(element);
}

$(window).on('resize', function () {
   wavesurfer.drawer.containerWidth = wavesurfer.drawer.container.clientWidth;
   wavesurfer.drawBuffer();
});

function isNumber(evt) {
   evt = (evt) ? evt : window.event;
   var charCode = (evt.which) ? evt.which : evt.keyCode;
   if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
   }
   return true;
}
