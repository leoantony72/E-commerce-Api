export async function uploadimg(file: any) {
  let sampleFile: any;
  let uploadPath;
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = file;
  var file_name = new Date().getTime() + "_" + file.name;
  uploadPath = "/mnt/e/codee/e-commerce/images/" + file_name;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, function (err: string) {
    if (err) throw err;
  });
  return file_name;
}
