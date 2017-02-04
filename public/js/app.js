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
  //var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera.position.y = 30;
  camera.position.z = 200;

  var ship = new THREE.Object3D();
  var shipGeometry = new THREE.BoxGeometry(40, 90, 10);
  var armGeometry = new THREE.BoxGeometry(10, 10, 10);
  var gunGeometry = new THREE.BoxGeometry(10, 40, 10);
  var cubeMaterial = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});

  function addCube(data) {
    var cube = new THREE.Mesh(data.geometry, cubeMaterial);
    cube.position.x = data.x
    cube.position.y = data.y
    cube.position.z = data.z
    cube.rotation.set(0, 0, 0);
    cube.name = data.name;
    ship.add(cube);
  }

  addCube({ name: 'shipbody', geometry: shipGeometry, x: 5, y: 0, z: 2 });
  addCube({ name: 'shipleftarm', geometry: armGeometry, x: -20, y: 0, z: 2 });
  addCube({ name: 'shipleftgun', geometry: gunGeometry, x: -30, y: 0, z: 2 });
  addCube({ name: 'shiprightarm', geometry: armGeometry, x: 30, y: 0, z: 2 });
  addCube({ name: 'shiprightgun', geometry: gunGeometry, x: 40, y: 0, z: 2 });
  scene.add(ship);

  var pivot = new THREE.Group();
  scene.add(pivot);
  pivot.add(ship);

  function render() {
    requestAnimationFrame(render);
    pivot.rotation.x = $scope.current.z / -6;
	  //pivot.rotation.y = $scope.current.x / -6;
    pivot.rotation.z = $scope.current.y / -6;
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
