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
  var camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight, 1,10000);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  var geometry = new THREE.BoxGeometry(500, 900, 100, 5, 10, 2);
  var material = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});
  var cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  camera.position.z = 1000;

  function render() {
    requestAnimationFrame(render);
    cube.rotation.x = $scope.current.z / -6;
	  //cube.rotation.y = $scope.current.x / -10;
    cube.rotation.z = $scope.current.y / -6;
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
