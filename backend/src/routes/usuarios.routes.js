const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

router.get('/', usuariosController.getUsuarios);
router.get('/roles', usuariosController.getRoles);
router.post('/', usuariosController.createUsuario);
router.delete('/:id', usuariosController.deleteUsuario);
router.patch('/:id/estado', usuariosController.toggleEstadoUsuario);
router.patch('/:id/rol', usuariosController.cambiarRolUsuario);

module.exports = router;
