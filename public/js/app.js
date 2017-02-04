'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'btford.socket-io'
]).
factory('mySocket', function (socketFactory) {
  return socketFactory();
}).
controller('AppCtrl', function ($scope, $window, mySocket) {
  $scope.current = {
    x: 0,
    y: 0,
    z: 0
  }
  $scope.previous = {
    x: 0,
    y: 0,
    z: 0
  }

  var scene = new THREE.Scene();
  var bulletcaster = new THREE.Raycaster();
  var astroidcaster = new THREE.Raycaster();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 2000);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera.position.y = 20;
  camera.position.z = 50;

  var bullets = [];
  var astroids = [];

  var ship = new THREE.Object3D();
  var shipGeometry = new THREE.BoxGeometry(10, 20, 3);
  var armGeometry = new THREE.BoxGeometry(3, 3, 1.5);
  var gunGeometry = new THREE.BoxGeometry(3, 10, 3);
  var bulletGeometry = new THREE.SphereGeometry(1.5, 3, 3);


  var shipMaterial = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});
  var bulletMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true});
  var astroidMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});

  function addCube(data) {
    var cube = new THREE.Mesh(data.geometry, data.material);
    cube.position.x = data.x
    cube.position.y = data.y
    cube.position.z = data.z
    cube.rotation.set(0, 0, 0);
    cube.name = data.name;
    ship.add(cube);
  }

  function shootGun(data) {
    var cube = new THREE.Mesh(data.geometry, data.material);
    cube.position.x = data.x
    cube.position.y = data.y
    cube.position.z = data.z
    cube.name = data.name;

    cube.velocity = new THREE.Vector3(
      -pivot.rotation.z,
      pivot.rotation.x + Math.PI / 2,
      1
    );

    cube.alive = true;
    setTimeout(function() {
      cube.alive = false;
      scene.remove(cube);
    }, 5000);

    bullets.push(cube);
    scene.add(cube);
  }

  function sendAstroid(data) {
    var geometry = new THREE.SphereGeometry(Math.random() * 200, 5, 5);
    var cube = new THREE.Mesh(geometry, data.material);
    cube.position.x = 1000 - Math.random() * 2000;
    cube.position.y = 500 - Math.random() * 1000;
    cube.position.z = -2000
    cube.rotation.set(Math.random(), Math.random(), Math.random());
    cube.name = data.name;

    cube.velocity = new THREE.Vector3(
      -pivot.rotation.z,
      pivot.rotation.x + Math.PI / 2,
      1
    );

    astroids.push(cube);
    scene.add(cube);
  }

  addCube({ name: 'shipbody', geometry: shipGeometry, material: shipMaterial, x: 0, y: 0, z: 0 });
  addCube({ name: 'shipleftarm', geometry: armGeometry, material: shipMaterial, x: -6.5, y: 0, z: 0 });
  addCube({ name: 'shipleftgun', geometry: gunGeometry, material: shipMaterial, x: -9.5, y: 0, z: 0 });
  addCube({ name: 'shiprightarm', geometry: armGeometry, material: shipMaterial, x: 6.5, y: 0, z: 0 });
  addCube({ name: 'shiprightgun', geometry: gunGeometry, material: shipMaterial, x: 9.5, y: 0, z: 0 });
  scene.add(ship);

  var pivot = new THREE.Group();
  scene.add(pivot);
  pivot.add(ship);

  setInterval(function() {
    shootGun({ name: 'bulletleft', geometry: bulletGeometry, material: bulletMaterial, x: -9.5, y: 0, z: 0, rx: pivot.rotation.x, ry: pivot.rotation.y, rz: pivot.rotation.z })
    shootGun({ name: 'bulletright', geometry: bulletGeometry, material: bulletMaterial, x: 9.5, y: 0, z: 0, rx: pivot.rotation.x, ry: pivot.rotation.y, rz: pivot.rotation.z });
  }, 500);

  setInterval(function() {
    sendAstroid({ name: 'astroid', material: astroidMaterial });
  }, 1000);

  function render() {
    requestAnimationFrame(render);
    pivot.rotation.x = $scope.current.z / -6;
	  //pivot.rotation.y = $scope.current.x / -6;
    pivot.rotation.z = $scope.current.y / -6;

    for (var i = 0; i < bullets.length; i++) {
      if (bullets[i] == undefined)
        continue;
      if (!bullets[i].alive) {
        scene.remove(bullets[i]);
        bullets.splice(i, 1);
        continue;
      }

      bulletcaster.set(bullets[i].position, bullets[i].velocity);
      var intersects = bulletcaster.intersectObjects( astroids );
      if (intersects.length > 0 && intersects[0].distance < 5 && intersects[0].object.name == "astroid") {
        scene.remove(bullets[i]);
        scene.remove(intersects[0].object);
        bullets.splice(i, 1);
        continue;
      }

      bullets[i].position.x += bullets[i].velocity.x * 20;
      bullets[i].position.y += bullets[i].velocity.y * 20;
      bullets[i].position.z -= bullets[i].velocity.z * 20;
    }

    for (var i = 0; i < astroids.length; i++) {
      if (astroids[i] == undefined) {
        astroids.splice(i, 1);
        continue;
      }
      if (astroids[i].position.z > camera.position.z) {
        scene.remove(astroids[i]);
        astroids.splice(i, 1);
        continue;
      }

      astroids[i].position.z += astroids[i].velocity.z;
    }

    renderer.render(scene, camera);
  };
  render();

  mySocket.on('message', function(data) {
    $scope.previous = $scope.current;

    $scope.current.x = data.x;
    $scope.current.y = data.y;
    $scope.current.z = data.z;
  });
});
