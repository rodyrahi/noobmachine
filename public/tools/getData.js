async function getData(fileInput) {
    const fileContent = await readFile(fileInput.files[0]);
    const lines = fileContent.split('\n');
    return lines
}
  
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (event) => reject(event.target.error);
      reader.readAsText(file);
    });
  }