/**
 * Gera hash bcrypt de uma senha informada por argumento.
 * Útil para criar/atualizar seeds com senhas próprias.
 *
 * Uso:  node scripts/generate-hash.js minhasenha
 */
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
    console.error('Uso: node scripts/generate-hash.js <senha>');
    process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
    console.log(hash);
});
