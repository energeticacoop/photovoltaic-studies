/**
 * Creates a document or spreadsheet from a template by substituting named ranges in a spreadsheet.
 * Supports additional content handlers and optional PDF export.
 *
 * @param {Object} templateProps - Template configuration.
 * @param {string} templateProps.templateId - File ID of the template.
 * @param {string} templateProps.filename - Output file name.
 * @param {boolean} templateProps.exportToPDF - Whether to generate a PDF copy.
 * @param {boolean} templateProps.copyComments - Whether to copy comments and replies from the original template.
 * @param {GoogleAppsScript.Drive.Folder} destinationFolder - Folder object to place the output file in.
 * @param {Object} [delimiters={left:'<', right:'>'}] - Delimiters used for identifying substitution tokens.
 * @param {Function} [customHandlerFn=null] - Optional handler for special template-specific processing.
 * @returns {GoogleAppsScript.Drive.File} The created file.
 */
function createDocumentFromTemplate(templateProps, destinationFolder, delimiters = { left: '<', right: '>' }, customHandlerFn = null) {
  const {
    filename,
    templateId,
    exportToPDF,
    copyComments
  } = templateProps;

  Tools.deleteFile(filename, destinationFolder);

  const templateFile = DriveApp.getFileById(templateId);
  const mimeType = templateFile.getMimeType();
  const copy = templateFile.makeCopy(filename, destinationFolder);

  const searchPattern = `${delimiters.left}.*?${delimiters.right}`;

  if (mimeType === "application/vnd.google-apps.document") {
    const doc = DocumentApp.openById(copy.getId());

    replaceSignatureIfPresent(doc, delimiters);
    replaceTextInDoc(doc, searchPattern, delimiters);

    if (copyComments) copyCommentsAndReplies(copy, templateId);
    if (typeof customHandlerFn === 'function') customHandlerFn(doc);

    doc.saveAndClose();

    if (exportToPDF) {
      const pdfFilename = filename + ".pdf";
      Tools.deleteFile(pdfFilename, destinationFolder);
      const pdf = DriveApp.createFile(doc.getAs('application/pdf'));
      pdf.moveTo(destinationFolder);
      pdf.setName(pdfFilename);
    }

  } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
    const sheet = SpreadsheetApp.openById(copy.getId());
    replaceTextInSheet(sheet, searchPattern, delimiters);

    if (copyComments) copyCommentsAndReplies(copy, templateId);
  }

  return copy;
}


/**
 * Replaces the signature placeholder in the document with the actual image.
 * @param {GoogleAppsScript.Document.Document} doc - The document object.
 * @param {Object} delimiters - Left and right delimiters for the token.
 */
function replaceSignatureIfPresent(doc, delimiters) {
  const SIGNATURE_NAMED_RANGE = "firmaIngeniera";
  const token = `${delimiters.left}${SIGNATURE_NAMED_RANGE}${delimiters.right}`;
  const body = doc.getBody();
  if (body.findText(token)) {
    const signatureBlob = DriveApp.getFileById(get(SIGNATURE_NAMED_RANGE)).getBlob();
    replaceImage(doc, token, signatureBlob, 300);
  }
}

/**
 * Replaces all token placeholders in a document using named ranges.
 * @param {GoogleAppsScript.Document.Document} doc - The document object.
 * @param {string} pattern - Regex pattern to identify tokens.
 * @param {Object} delimiters - Left and right delimiters.
 */
function replaceTextInDoc(doc, pattern, delimiters) {
  const parent = doc.getBody().getParent();

  for (let i = 0; i < parent.getNumChildren(); i++) {
    const child = parent.getChild(i);
    const valuesToReplace = new Set();
    let range = child.findText(pattern);

    while (range) {
      const matches = range.getElement().asText().getText().matchAll(pattern);
      for (const match of matches) {
        valuesToReplace.add(match[0]);
      }
      range = child.findText(pattern, range);
    }

    for (const token of valuesToReplace) {
      const name = token.slice(delimiters.left.length, -delimiters.right.length);
      const namedRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(name);
      if (namedRange) {
        child.replaceText(token, namedRange.getDisplayValue());
      }
    }
  }
}

/**
 * Replaces all token placeholders in a spreadsheet using named ranges.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheet - The spreadsheet object.
 * @param {string} pattern - Regex pattern to identify tokens.
 * @param {Object} delimiters - Left and right delimiters.
 */
function replaceTextInSheet(sheet, pattern, delimiters) {
  const matches = sheet.createTextFinder(pattern).useRegularExpression(true).findAll();
  const tokens = new Set();

  matches.forEach(cell => {
    const found = cell.getValue().matchAll(pattern);
    for (const match of found) {
      tokens.add(match[0]);
    }
  });

  for (const token of tokens) {
    const name = token.slice(delimiters.left.length, -delimiters.right.length);
    const namedRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(name);
    if (namedRange) {
      sheet.createTextFinder(token).replaceAllWith(get(name));
    }
  }
}

/**
 * Copies all comments and their replies from the original file to the copied file.
 * @param {GoogleAppsScript.Drive.File} copy - The newly created file.
 * @param {string} templateId - ID of the source template.
 */
function copyCommentsAndReplies(copy, templateId) {
  const newDocId = copy.getId();
  const comments = Drive.Comments.list(templateId, { maxResults: 100 });

  comments.items.forEach(item => {
    const replies = item.replies || [];
    delete item.replies;

    const inserted = Drive.Comments.insert(item, newDocId);
    replies.forEach(reply => Drive.Replies.insert(reply, newDocId, inserted.commentId));
  });
}
