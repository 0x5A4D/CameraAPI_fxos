document.addEventListener("DOMContentLoaded", function() {

    var CameraManager = window.navigator.mozCamera || window.navigator.mozCameras;

    var options = {
      mode: 'picture',
      recorderProfile: 'jpg',
      previewSize: {
        width: 320,
        height: 192
      }
    };
    
    var camera = null;
    var idx = 0;

    function onSuccess(CameraControl) {
        camera = CameraControl;
        console.log('success: ', camera);
        var video = document.getElementById('video');
        var rot   = (cameraType === 'back') ? 90 : -90;
        video.mozSrcObject = camera;
        video.style.transform = 'rotate(' + rot + 'deg)';
        video.play();
        
        // Effect
        var effectsBtn = document.getElementById('effects');
        var effects = camera.capabilities.effects;
        if(effects < 1){
            effectsBtn.setAttribute('disabled', 'disabled');
        }else{
            //console.log(effects);
            effectsBtn.addEventListener('click', function(){
                idx = (idx === effects.length) ? 0 : ++idx; 
                camera.effect = effects[idx];
            });
        }
        
    };

    function onError(error) {
        console.warn(error);
    };
    
    function releaseCamera(){
        if(camera){
            camera.release();
        }
    }

    function getCamera(){
        releaseCamera();
        CameraManager.getCamera(cameraType, options, onSuccess, onError);   
    }
    
    // ボタン
    var start = document.getElementById('start');
    var end = document.getElementById('end');
    start.addEventListener('click', function(){
        getCamera();
    });
    end.addEventListener('click', function(){
        releaseCamera();
    });
    
    // カメラ開始
    if(CameraManager){
        var cameraType = CameraManager.getListOfCameras()[0];
        getCamera();
    }

    // 終了時に解放
    window.addEventListener('unload', releaseCamera);
    
    // Canvas処理開始
    processor.doLoad(options.previewSize.width/2, options.previewSize.height/2);
});


var processor = {
    timerCallback: function() {
      if (this.video.paused || this.video.ended) {
        return;
      }
      this.computeFrame();
      var self = this;
      setTimeout(function () {
          self.timerCallback();
        }, 0);
    },

    doLoad: function(width, height) {
      this.video = document.getElementById("video");
      this.c1 = document.getElementById("c1");
      this.ctx1 = this.c1.getContext("2d");
      this.c2 = document.getElementById("c2");
      this.ctx2 = this.c2.getContext("2d");
      this.width  = width;
      this.height = height;
      var self = this;
      this.video.addEventListener("play", function() {
          /*
          self.width = self.video.videoWidth / 2;
          self.height = self.video.videoHeight / 2;
          */
          self.timerCallback();
        }, false);
    },

    computeFrame: function() {
        // video要素からCanvasに描画
        this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);

        // pixcel毎に処理するなら以下
        /*
        var frame = this.ctx1.getImageData(0, 0, this.width, this.height);
        var l = frame.data.length / 4;
        for (var i = 0; i < l; i++) {
          var r = frame.data[i * 4 + 0];
          var g = frame.data[i * 4 + 1];
          var b = frame.data[i * 4 + 2];
          if (g > 100 && r > 100 && b < 43)
          frame.data[i * 4 + 3] = 0;
        }
        this.ctx2.putImageData(frame, 0, 0);
        */
        
        var w = this.width / 2;
        var h = this.height / 2;
        this.ctx2.drawImage(this.video, 0, 0, w, h, w, h, w, h);
        this.ctx2.drawImage(this.c1, w, h, w, h, 0, 0, w, h);
        this.ctx2.drawImage(this.c1, w, 0, w, h, 0, h, w, h);
        this.ctx2.drawImage(this.c1, 0, h, w, h, w, 0, w, h);
       
        return;
    }
};
