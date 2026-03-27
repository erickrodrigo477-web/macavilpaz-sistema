const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

router.get('/', usuariosController.getUsuarios);
router.get('/roles', usuariosController.getRoles);
router.post('/', usuariosController.createUsuario);
router.delete('/:id', usuariosController.deleteUsuario);

module.exports = router;
