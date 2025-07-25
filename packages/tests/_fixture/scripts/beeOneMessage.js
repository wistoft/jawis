util.inspect.colors = false;

// remove listener on first message

module.exports.main = (prov) => {
  const onMessage = (msg) => {
    console.log({ msg });
    prov.removeOnMessage(onMessage);
  };

  prov.registerOnMessage(onMessage);
};
