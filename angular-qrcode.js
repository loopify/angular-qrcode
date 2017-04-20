/*
 * angular-qrcode
 * (c) 2017 Monospaced http://monospaced.com
 * License: MIT
 */

if (typeof module !== 'undefined' &&
    typeof exports !== 'undefined' &&
    module.exports === exports){
  module.exports = 'monospaced.qrcode';
}

angular.module('monospaced.qrcode', [])
  .directive('qrcode', ['$window', function($window) {
    var levels = {
        'L': 'Low',
        'M': 'Medium',
        'Q': 'Quartile',
        'H': 'High'
      };
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        var domElement = element[0],
            download = 'download' in attrs,
            href = attrs.href,
            link = download || href ? document.createElement('a') : '',
            trim = /^\s+|\s+$/g,
            error,
            version,
            errorCorrectionLevel,
            data,
            size,
            modules,
            tile,
            qr,
            $img,
            color = {
              foreground: '#000',
              background: '#fff'
            },
            setColor = function(value) {
              color.foreground = value || color.foreground;
            },
            setBackground = function(value) {
              color.background = value || color.background;
            },
            setVersion = function(value) {
              version = Math.max(1, Math.min(parseInt(value, 10), 40)) || 5;
            },
            setErrorCorrectionLevel = function(value) {
              errorCorrectionLevel = value in levels ? value : 'M';
            },
            setData = function(value) {
              if (!value) {
                return;
              }

              data = value.replace(trim, '');
              qr = qrcode(version, errorCorrectionLevel);
              qr.addData(data);

              try {
                qr.make();
              } catch (e) {
                var newVersion;
                if (version >= 40) {
                  throw new Error('Data is too long', e);
                }
                newVersion = version + 1;
                setVersion(newVersion);
                console.warn('qrcode version is too low and has been incremented to', newVersion)
                setData(value);
                return;
              }

              error = false;
              modules = qr.getModuleCount();
            },
            setSize = function(value) {
              size = parseInt(value, 10) || modules * 2;
              tile = size / modules;
            },
            render = function() {
              if (!qr) {
                return;
              }

              if (error) {
                if (link) {
                  link.removeAttribute('download');
                  link.title = '';
                  link.href = '#_';
                }
                domElement.innerHTML = '<img src width="' + size + '"' +
                                       'height="' + size + '"' +
                                       'class="qrcode">';
                scope.$emit('qrcode:error', error);
                return;
              }

              if (download) {
                domElement.download = 'qrcode.png';
                domElement.title = 'Download QR code';
              }

              domElement.innerHTML = qr.createSvgTag(tile, 0);
              $img = element.find('svg');
              $img.css({'background': color.background, 'padding': '1mm', 'box-sizing': 'content-box'});
              $img.addClass('qrcode');

              if (download) {
                domElement.href = $img[0].src;
                return;
              }

              if (href) {
                domElement.href = href;
              }
            };

        if (link) {
          link.className = 'qrcode-link';
          $img.wrap(link);
          domElement = domElement.firstChild;
        }

        setColor(attrs.color);
        setBackground(attrs.background);
        setVersion(attrs.version);
        setErrorCorrectionLevel(attrs.errorCorrectionLevel);
        setSize(attrs.size);

        attrs.$observe('version', function(value) {
          if (!value) {
            return;
          }

          setVersion(value);
          setData(data);
          setSize(size);
          render();
        });

        attrs.$observe('errorCorrectionLevel', function(value) {
          if (!value) {
            return;
          }

          setErrorCorrectionLevel(value);
          setData(data);
          setSize(size);
          render();
        });

        attrs.$observe('data', function(value) {
          if (!value) {
            return;
          }

          setData(value);
          setSize(size);
          render();
        });

        attrs.$observe('size', function(value) {
          if (!value) {
            return;
          }

          setSize(value);
          render();
        });

        attrs.$observe('color', function(value) {
          if (!value) {
            return;
          }

          setColor(value);
          render();
        });

        attrs.$observe('background', function(value) {
          if (!value) {
            return;
          }

          setBackground(value);
          render();
        });

        attrs.$observe('href', function(value) {
          if (!value) {
            return;
          }

          href = value;
          render();
        });
      }
    };
  }]);
