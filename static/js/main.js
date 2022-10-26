
// alert("het werkt");
/*
Create canvas
*/
document.addEventListener('DOMContentLoaded', (e) => {
  const fileSelect = document.getElementById('file-select');
  const fileFail = document.getElementById('file-fail-select');
  const cvs = document.getElementById('cvs');
  const ctx = cvs.getContext('2d');
  const img = new Image();  
  const upLoad = document.getElementById('upload');
  fileSelect.addEventListener("click", (e) => {
    if (upLoad) {
      upLoad.click();
    }
    e.preventDefault();
  }, false);
  
  upLoad.addEventListener("change", (e) => {
    const [file] = upLoad.files;
    console.log("file", file)
    if (!file) {
      fileFail.innerHTML = "Oeps... Je hebt niks geselecteerd!";
      fileFail.style.display = "inline-block";
      return;
    }

    const imgFilename = file.name
    console.log("imgFilename: ", imgFilename)
    // ext = file.name.split('.').pop();
    // console.log("ext: ", ext)
    // if (ext !== ("JPG" || "PNG" || "jpg" || "png")) {
    //   fileFail.innerHTML = "Oeps... Gebruik alleen JPG of PNG foto's.";
    //   fileFail.style.display = "inline-block";
    //   return;
    // }
    // console.log("extension: ", ext);
    img.src = URL.createObjectURL(file);
    img.onload = function() {
      if (img.height > img.width) {
        sX = 0
        sY = Math.floor((img.height - img.width) / 2)
        sW = img.width
      } else {
        sX = Math.floor((img.width - img.height) / 2)
        sY = 0
        sW = img.height
      }
      ctx.drawImage(img, sX, sY, sW, sW, 0, 0, 150, 150);
      URL.revokeObjectURL(img.src);

      cvs.toBlob(function(blob) {
        // Filename 'thumbNailFile.jpg' is actually extracted
        // and can be used in main.go
        let file = new File([blob], imgFilename,
          {type: 'image/jpeg', lastModified: new Date().getTime() } ),
        transfer = new DataTransfer();
        transfer.items.add(file);
        let input = document.getElementById('upload');
        input.files = transfer.files;
        console.log("input.files: ", input.files)
        // Populate a hidden field with a known detectable control phrase
        document.getElementById('control-phrase').value = 'thumbControlPhrase'
      }, 'image/jpeg', 0.9);

      // /*
      // This is executed right after display the cropped
      // image in canvas. The resulting file is stored
      // in: ~/Downloads/cropped-image.png
      // */
      // cvs.toBlob( blob => {
      //   // create a URL from the now in memory blob
      //   // const anchor = document.getElementById('dowload-link')
      //   const anchor = document.createElement('a')
      //   // optional but we give the file a name.
      //   anchor.download = 'cropped-image.png'
      //   anchor.href = URL.createObjectURL(blob)
      //   // this starts automatic file download
      //   anchor.click()
      //   // release/remove the blob from memory. We don't need
      //   // it anymore because it's now in a file.
      //   URL.revokeObjectURL(anchor.href)
        
      //   // const myBlob = URL.createObjectURL(blob)
      //   // const file = new File([myBlob], "cropped-image.png")
      //   // <File>file
        
      // }, 'image/png', 0.9)

    }
  }, false);
});