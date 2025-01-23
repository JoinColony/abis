const { resolve } = require('path');

module.exports = {
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          resolve(__dirname, '*.ts'),
        ]
      }
    ]
  }
}

