module.exports = function (options) {
    options.watchOptions = {
      poll: 1000, // Verifica por mudanças a cada segundo
      aggregateTimeout: 300, // Atraso antes de reconstruir após a primeira mudança
    };
    return options;
  };