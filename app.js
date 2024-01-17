const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Set the image directory
const imageDir = path.join(__dirname, 'images');

// Serve static files from image directory
app.use('/images', express.static(imageDir));

// Whitelisted file extensions or filenames
const allowedFileExtensions = ['jpg', 'jpeg', 'png', 'gif'];
const allowedFilenames = ['file1', 'file2']; // Add your whitelisted filenames

// Validate filename before serving
app.get('/images/:filename', async (req, res) => {
  const allowedChars = /^[a-zA-Z0-9._-]+$/;
  const filename = req.params.filename;

  // Reject path traversal sequences
  if (filename.includes('..') || filename.includes('%2e%2e')) {
    return res.status(400).send('Invalid filename');
  }

  // Check against allowed filenames or extensions
  const fileExtension = path.extname(filename).slice(1).toLowerCase();
  if (
    !allowedChars.test(filename) ||
    (!allowedFileExtensions.includes(fileExtension) && !allowedFilenames.includes(filename))
  ) {
    return res.status(400).send('Invalid filename or extension');
  }

  try {
    const sanitizedFilename = path.normalize(filename);
    const filePath = path.join(imageDir, sanitizedFilename);
    const file = await fs.promises.stat(filePath);

    // Check if the file exists and is a regular file
    if (file.isFile()) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Image not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

app.listen(port, () => {
  console.log(`Image API listening on port ${port}`);
});
