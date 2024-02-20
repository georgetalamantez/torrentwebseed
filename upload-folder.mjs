// The 'got' module gives a promised-based HTTP client.
import got from 'got';

// The 'fs' built-in module provides access to the file system.
import fs from 'fs';

// The 'form-data' module helps us submit forms and file uploads
// to other web applications.
import FormData from 'form-data';

// The 'recursive-fs' module provides async recursive file system operations.
import rfs from 'recursive-js';

// The 'base-path-converter' module trims file paths from a base path.
import basePathConverter from 'base-path-converter';

/**
 * Uploads a folder from `folderpath` and pins it to the Storj IPFS pinning service.
 * @param {string} username your username for the Storj IPFS pinning service
 * @param {string} password your password for the Storj IPFS pinning service
 * @param {string} folderpath the path to the folder
 */
async function pinFolderToIPFS(username, password, folderpath) {
  // The HTTP upload endpoint of the Storj IPFS pinning service
  const url = `https://www.storj-ipfs.com/api/v0/add`;

  // Create a form with the folder and its files to upload
  let data = new FormData();
  const { dirs, files } = await rfs.read(folderpath);
  for (const file of files) {
    data.append(`file`, fs.createReadStream(file), {
      filepath: basePathConverter(folderpath, file),
    });
  }

  // Execute the Upload request to the Storj IPFS pinning service
  return got
    .post(url, {
      username: username,
      password: password,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      },
      body: data,
    })
    .on('uploadProgress', (progress) => {
      console.log(progress);
    });
}

/**
 * The main entry point for the script that checks the command line arguments and
 * calls pinFolderToIPFS.
 *
 * To simplify the example, we don't do fancy command line parsing. Just three
 * positional arguments for username, password, and folder path.
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 3) {
    console.error(
      `usage: ${process.argv[0]} ${process.argv[1]} <username> <password> <folderpath>`
    );
    process.exit(1);
  }

  const [username, password, folderpath] = args;
  const response = await pinFolderToIPFS(username, password, folderpath);
  console.log(response.body);
}

/**
 * Don't forget to call the main function!
 * We can't `await` things at the top level, so this adds
 * a .catch() to grab any errors and print them to the console.
 */
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
