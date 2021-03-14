const copyDataToClipboard = (data) => async () => {
  const element = document.createElement("textarea");

  element.value = data;
  document.body.appendChild(element);
  element.select();
  document.execCommand("copy");
  document.body.removeChild(element);
};

export default copyDataToClipboard;
