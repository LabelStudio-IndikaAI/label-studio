import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Modal } from '../../../components/Modal/Modal';
import { Elem } from '../../../utils/bem';
import { Space } from '../../../components/Space/Space';
import { Button } from '../../../components';
import { cn } from '../../../utils/bem';
import { unique } from '../../../utils/helpers';
import "./Import.styl";
import { IconDoneimport, IconError, IconGreentech, IconInfo, IconLink, IconUpload, IconUploadfiles } from '../../../assets/icons';
import { useAPI } from '../../../providers/ApiProvider';

const importClass = cn("upload_page");
const dropzoneClass = cn("dropzone");

function flatten(nested) {
  return [].concat(...nested);
}

// Keep in sync with core.settings.SUPPORTED_EXTENSIONS on the BE.
const supportedExtensions = {
  text: ['txt'],
  audio: ['wav', 'mp3', 'flac', 'm4a', 'ogg'],
  video: ['mp4', 'webp', 'webm'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
  html: ['html', 'htm', 'xml'],
  timeSeries: ['csv', 'tsv'],
  common: ['csv', 'tsv', 'txt', 'json'],
};
const allSupportedExtensions = flatten(Object.values(supportedExtensions));

function getFileExtension(fileName) {
  if (!fileName) {
    return fileName;
  }
  return fileName.split('.').pop().toLowerCase();
}

function traverseFileTree(item, path) {
  return new Promise((resolve) => {
    path = path || "";
    if (item.isFile) {
      // Avoid hidden files
      if (item.name[0] === ".") return resolve([]);

      resolve([item]);
    } else if (item.isDirectory) {
      // Get folder contents
      const dirReader = item.createReader();
      const dirPath = path + item.name + "/";

      dirReader.readEntries(function (entries) {
        Promise.all(entries.map(entry => traverseFileTree(entry, dirPath)))
          .then(flatten)
          .then(resolve);
      });
    }
  });
}

function getFiles(files) {
  // @todo this can be not a files, but text or any other draggable stuff
  return new Promise(resolve => {
    if (!files.length) return resolve([]);
    if (!files[0].webkitGetAsEntry) return resolve(files);

    // Use DataTransferItemList interface to access the file(s)
    const entries = Array.from(files).map(file => file.webkitGetAsEntry());

    Promise.all(entries.map(traverseFileTree))
      .then(flatten)
      .then(fileEntries => fileEntries.map(fileEntry => new Promise(res => fileEntry.file(res))))
      .then(filePromises => Promise.all(filePromises))
      .then(resolve);
  });
}

// const Footer = () => {
//   return (
//     <Modal.Footer>
//       <IconInfo className={importClass.elem("info-icon")} width="20" height="20" />
//       See the&nbsp;documentation to <a target="_blank" href="https://labelstud.io/guide/predictions.html">import preannotated data</a>{" "}
//       or&nbsp;to <a target="_blank" href="https://labelstud.io/guide/storage.html">sync data from a&nbsp;database or&nbsp;cloud storage</a>.
//     </Modal.Footer>
//   );
// };
const PopupContent = ({ onClose }) => (
  <Modal
    title="Import File Guideline"
    halfscreen
    visible
    bare
  >
    <div className="popup-content" style={{
      flex: '1',
      minHeight: '0',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <Modal.Header divided>
        <Elem block="modal" name="title">Import File Guideline</Elem>

        <Space>
          <Button onClick={onClose} className="close-button">Close</Button>
        </Space>
      </Modal.Header>
      <div className="table-container" style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        alignItems: 'flex-start',
      }}>
        <div className="table-left">

          <div className={dropzoneClass.elem("content")}>
            <h4 style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}><IconDoneimport style={{ verticalAlign: 'middle' }} /> Support File Formats</h4>
            <dl>
              <dt>Common Formats</dt><dd>{supportedExtensions.common.join(', ')}</dd>
              <dt>Text</dt><dd>{supportedExtensions.text.join(', ')}</dd>
              <dt>Audio</dt><dd>{supportedExtensions.audio.join(', ')}</dd>
              <dt>Video</dt><dd>mpeg4/H.264 webp, webm* {/* Keep in sync with supportedExtensions.video */}</dd>
              <dt>Images</dt><dd>{supportedExtensions.image.join(', ')}</dd>
              <dt>HTML</dt><dd>{supportedExtensions.html.join(', ')}</dd>
              <dt>Time Series</dt><dd>{supportedExtensions.timeSeries.join(', ')}</dd>
            </dl>
          </div>
        </div>

        <div className="table-right">

          {/* Add the second table here */}
          <div className={dropzoneClass.elem("content")}>
            <h4 style={{ display: 'flex', alignItems: 'baseline', marginRight: '330px', fontWeight: 'bold' }}><IconGreentech style={{ verticalAlign: 'middle' }} /> Import File Guideline</h4>
            <dl>
              <dt>• Make sure you upload or import files according to your configured template</dt><dd></dd>
              <dt>• Use cloud storages for importing a large number of files</dt><dd></dd>
              <dt>* Video files support depends on the browser</dt><dd></dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </Modal >
);

const Upload = ({ children, sendFiles }) => {
  const [hovered, setHovered] = useState(false);
  const onHover = (e) => {
    e.preventDefault();
    setHovered(true);
  };
  const onLeave = setHovered.bind(null, false);
  const dropzoneRef = useRef();

  const onDrop = useCallback(e => {
    e.preventDefault();
    onLeave();
    getFiles(e.dataTransfer.items).then(files => sendFiles(files));
  }, [onLeave, sendFiles]);

  return (
    <div id="holder" className={dropzoneClass.mod({ hovered })} ref={dropzoneRef}
      onDragStart={onHover}
      onDragOver={onHover}
      onDragLeave={onLeave}
      onDrop={onDrop}
    // {...getRootProps}
    >
      {children}
    </div>
  );
};

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  let extra = error.validation_errors ?? error.extra;
  // support all possible responses

  if (extra && typeof extra === "object" && !Array.isArray(extra)) {
    extra = extra.non_field_errors ?? Object.values(extra);
  }
  if (Array.isArray(extra)) extra = extra.join("; ");

  return (
    <div className={importClass.elem("error")}>
      <IconError style={{ marginRight: 8 }} />
      {error.id && `[${error.id}] `}
      {error.detail || error.message}
      {extra && ` (${extra})`}
    </div>
  );
};


export const ImportPage = ({
  project,
  show = true,
  onWaiting,
  onFileListUpdate,
  highlightCsvHandling,
  dontCommitToProject = false,
  csvHandling,
  setCsvHandling,
  addColumns,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState();
  const api = useAPI();

  const processFiles = (state, action) => {
    console.log('Reducer action received:', action);

    if (action.sending) {
      const newState = { ...state, uploading: [...action.sending, ...state.uploading] };

      return newState;
    }
    if (action.sent) {
      const newState = { ...state, uploading: state.uploading.filter(f => !action.sent.includes(f)) };

      return newState;
    }
    if (action.uploaded) {
      const newState = { ...state, uploaded: unique([...state.uploaded, ...action.uploaded], (a, b) => a.id === b.id) };

      return newState;
    }
    if (action.type === 'DELETE_FILE') {
      const newState = {
        ...state,
        uploaded: state.uploaded.filter(file => file.id !== action.deletedFileId),
      };

      return newState;
    }
    if (action.ids) {
      const ids = unique([...state.ids, ...action.ids]);

      onFileListUpdate?.(ids);
      return { ...state, ids };
    }
    return state;
  };

  const [files, dispatch] = useReducer(processFiles, { uploaded: [], uploading: [], ids: [] });
  const showList = Boolean(files.uploaded?.length || files.uploading?.length);

  const loadFilesList = useCallback(async (file_upload_ids) => {
    const query = {};

    if (file_upload_ids) {
      // should be stringified array "[1,2]"
      query.ids = JSON.stringify(file_upload_ids);
    }
    const files = await api.callApi("fileUploads", {
      params: { pk: project.id, ...query },
    });

    dispatch({ uploaded: files ?? [] });

    if (files?.length) {
      dispatch({ ids: files.map(f => f.id) });
    }
    return files;
  }, [project]);

  const onStart = () => {
    setLoading(true);
    setError(null);
  };
  const onError = err => {
    console.error(err);
    // @todo workaround for error about input size in a wrong html format
    if (typeof err === "string" && err.includes("RequestDataTooBig")) {
      const message = "Imported file is too big";
      const extra = err.match(/"exception_value">(.*)<\/pre>/)?.[1];

      err = { message, extra };
    }
    setError(err);
    setLoading(false);
    onWaiting?.(false);
  };
  const onFinish = useCallback(async res => {
    const { could_be_tasks_list, data_columns, file_upload_ids } = res;

    dispatch({ ids: file_upload_ids });
    if (could_be_tasks_list && !csvHandling) setCsvHandling("choose");
    setLoading(true);
    onWaiting?.(false);
    addColumns(data_columns);

    return loadFilesList(file_upload_ids).then(() => setLoading(false));
  }, [addColumns, loadFilesList, setLoading]);

  const importFiles = useCallback(async (files, body) => {
    dispatch({ sending: files });

    const query = dontCommitToProject ? { commit_to_project: "false" } : {};
    // @todo use json for dataset uploads by URL
    const contentType = body instanceof FormData
      ? 'multipart/form-data' // usual multipart for usual files
      : 'application/x-www-form-urlencoded'; // chad urlencoded for URL uploads
    const res = await api.callApi("importFiles", {
      params: { pk: project.id, ...query },
      headers: { 'Content-Type': contentType },
      body,
      errorFilter: () => true,
    });

    if (res && !res.error) onFinish?.(res);
    else onError?.(res?.response);

    dispatch({ sent: files });
  }, [project, onFinish]);

  const sendFiles = useCallback(files => {
    onStart();
    onWaiting?.(true);
    files = [...files]; // they can be array-like object
    const fd = new FormData;

    for (let f of files) {
      if (!allSupportedExtensions.includes(getFileExtension(f.name))) {
        onError(new Error(`The filetype of file "${f.name}" is not supported.`));
        return;
      }
      fd.append(f.name, f);
    }
    return importFiles(files, fd);
  }, [importFiles, onStart]);

  const onUpload = useCallback(e => {
    sendFiles(e.target.files);
    e.target.value = "";
  }, [sendFiles]);

  const onLoadURL = useCallback(e => {
    e.preventDefault();
    onStart();
    const url = urlRef.current?.value;

    if (!url) {
      setLoading(false);
      return;
    }
    urlRef.current.value = "";
    onWaiting?.(true);
    const body = new URLSearchParams({ url });

    importFiles([{ name: url }], body);
  }, [importFiles]);

  useEffect(() => {
    if (project?.id !== undefined) {
      loadFilesList().then(files => {
        if (csvHandling) return;
        // empirical guess on start if we have some possible tasks list/time series problem
        if (Array.isArray(files) && files.some(({ file }) => /\.[ct]sv$/.test(file))) {
          setCsvHandling("choose");
        }
      });
    }
  }, [project, loadFilesList]);

  const urlRef = useRef();

  if (!project) return null;
  if (!show) return null;

  const csvProps = {
    name: "csv",
    type: "radio",
    onChange: e => setCsvHandling(e.target.value),
  };

  const handlePasteFromClipboard = () => {
    // Access the clipboard data
    navigator.clipboard.readText()
      .then((clipboardData) => {
        if (urlRef.current) {
          urlRef.current.value = clipboardData;
        }
      })
      .catch((error) => {
        console.error('Failed to read clipboard data:', error);
      });
  };


  const handleSelectAll = allFiles => {
    if (selectedFiles.length === allFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(allFiles);
    }
  };

  const handleFileSelect = file => {
    const newSelectedFiles = [...selectedFiles];

    if (newSelectedFiles.includes(file)) {
      newSelectedFiles.splice(newSelectedFiles.indexOf(file), 1);
    } else {
      newSelectedFiles.push(file);
    }
    setSelectedFiles(newSelectedFiles);
  };

  // Existing deleteFileApi function with enhanced error handling
  const deleteFileApi = async (fileId) => {
    try {
      console.log("Deleting file with ID:", fileId);
      const response = await api.callApi('deleteFileUploads', {
        method: 'DELETE',
        params: { pk: project.id },
        body: { file_upload_ids: [fileId] },
      });

      console.log("Response from delete API:", response);
      return response;
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file: " + error.message);
      return { deleted: false }; // Ensure a consistent response structure
    }
  };




  const handleDeleteFile = async (file) => {
    if (file && file.id) {
      const response = await deleteFileApi(file.id);

      if (response && response.deleted) {
        const updatedSelectedFiles = selectedFiles.filter(f => f.id !== file.id);

        setSelectedFiles(updatedSelectedFiles);
        dispatch({ type: 'DELETE_FILE', deletedFileId: file.id });
      } else {
        console.error('File deletion failed:', file);
      }
    } else {
      console.error("Invalid file or file ID");
    }
  };

  // Function to delete multiple files
  const deleteMultipleFilesApi = async (fileIds) => {
    try {
      console.log("Deleting files with IDs:", fileIds);
      const response = await api.callApi('deleteFileUploads', {
        method: 'DELETE',
        params: { pk: project.id },
        body: { file_upload_ids: fileIds },
      });

      console.log("Response from delete API:", response);
      return response;
    } catch (error) {
      console.error("Error deleting files:", error);
      alert("Error deleting files: " + error.message);
      return { deleted: false }; // Ensure a consistent response structure
    }
  };

  const handleDeleteAll = async () => {
    const fileIdsToDelete = selectedFiles.map(file => file.id);
    const response = await deleteMultipleFilesApi(fileIdsToDelete);

    if (response && response.deleted) {
      // Clear selected files and update the state
      setSelectedFiles([]);
      fileIdsToDelete.forEach(fileId => {
        dispatch({ type: 'DELETE_FILE', deletedFileId: fileId });
      });
    } else {
      console.error('Files deletion failed:', selectedFiles);
    }
  };


  const [showPopup, setShowPopup] = useState(false);

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // const TextPreview = ({ file }) => {
  //   // Placeholder for text content preview
  //   return <span>Text: {file.name}</span>;
  // };

  // const AudioPreview = ({ file }) => (
  //   <audio controls src={file.url} style={{ maxWidth: '100%' }} />
  // );

  // const VideoPreview = ({ file }) => (
  //   <video controls src={file.url} style={{ maxWidth: '100%' }} width="320" height="240" />
  // );

  // const ImagePreview = ({ file }) => (
  //   <img src={file.url} alt={file.name} style={{ maxWidth: '100%' }} />
  // );

  // const HTMLPreview = ({ file }) => {
  //   // Caution: Ensure to sanitize the HTML content
  //   return <iframe src={file.url} title={file.name} style={{ maxWidth: '100%' }} width="320" height="240" />;
  // };

  // const UnsupportedPreview = () => <span>Unsupported file type</span>;

  // const FilePreview = ({ file }) => {
  //   const fileExtension = getFileExtension(file.name);

  //   console.log(`Previewing file: ${file.name}, Extension: ${fileExtension}`);

  //   switch (fileExtension) {
  //     case 'txt':
  //     case 'csv':
  //     case 'tsv':
  //     case 'json':
  //       return <TextPreview file={file} />;
  //     case 'wav':
  //     case 'mp3':
  //     case 'flac':
  //     case 'm4a':
  //     case 'ogg':
  //       return <AudioPreview file={file} />;
  //     case 'mp4':
  //     case 'webm':
  //       return <VideoPreview file={file} />;
  //     case 'jpg':
  //     case 'jpeg':
  //     case 'png':
  //     case 'gif':
  //     case 'bmp':
  //     case 'svg':
  //     case 'webp':
  //       return <ImagePreview file={file} />;
  //     case 'html':
  //     case 'htm':
  //     case 'xml':
  //       return <HTMLPreview file={file} />;
  //     default:
  //       return <UnsupportedPreview />;
  //   }
  // };

  const countSelectedFiles = () => {
    return selectedFiles.length;
  };



  return (
    <div className={importClass}>
      {highlightCsvHandling && <div className={importClass.elem("csv-splash")} />}
      <input id="file-input" type="file" name="file" multiple onChange={onUpload} style={{ display: "none" }} />

      <header>
        <div className={`${importClass.elem("upload-container")}`}>
          {/* Upload Files section */}
          <div className="upload-files" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <IconUploadfiles />
            <h2>Drag and drop files here</h2>
            <p>Text, Audio, Video, Image, HTML, and more</p>
            <button onClick={() => document.getElementById('file-input').click()} className={importClass.elem("upload-button")}>
              <IconUpload width="16" height="16" className={importClass.elem("upload-icon")} />
              Browse Local {files.uploaded.length ? "More " : ""}Device
            </button>
            <span onClick={handleShowPopup} className="guide-button" style={{ color: '#00bfff', marginTop: '10px', cursor: 'pointer' }}>
              Click Me!
            </span>


            {showPopup && (
              <div className="overlay" onClick={handleClosePopup}>
                <PopupContent onClose={handleClosePopup} />
              </div>
            )}
          </div>
          <div className={importClass.elem("csv-handling").mod({ highlighted: highlightCsvHandling, hidden: !csvHandling })}>
            <span>Treat CSV/TSV as</span>
            <label><input {...csvProps} value="tasks" checked={csvHandling === "tasks"} /> List of tasks</label>
            <label><input {...csvProps} value="ts" checked={csvHandling === "ts"} /> Time Series or Whole Text File</label>
          </div>
        </div>

        <div className={importClass.elem("url-container")}>
          {/* URL section */}
          <form className={importClass.elem("url-form")} method="POST" onSubmit={onLoadURL}>
            <div className={importClass.elem("button-container")}>
              <button type="button" onClick={handlePasteFromClipboard}><IconLink /></button>
            </div>
            <input placeholder="Enter Dataset URL" name="url" ref={urlRef} />
            <div className={importClass.elem("button-container")}>
              <button type="submit">+ Add Files</button>
            </div>
          </form>
        </div>

        {/* <div className={importClass.elem("status")}>
          {files.uploaded.length ? `${files.uploaded.length} files uploaded` : null}
        </div> */}
        <ErrorMessage error={error} />
      </header>




      <main>
        <Upload sendFiles={sendFiles} project={project}>
          {showList && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', gap: '5px' }}>
                <span>{countSelectedFiles()} Selected Files</span>
                {/* {selectedFiles.length > 1 && <button onClick={handleDeleteAll}>Delete All</button>} */}
                <button
                  onClick={selectedFiles.length > 1 ? handleDeleteAll : null}
                  disabled={selectedFiles.length <= 1}
                  style={{
                    cursor: selectedFiles.length > 1 ? 'pointer' : 'not-allowed',
                    color: selectedFiles.length > 1 ? 'red' : '#a9a9a9',
                    borderColor: selectedFiles.length > 1 ? 'red' : '#a9a9a9',
                  }}
                >
                  Delete Files
                </button>
              </div>
              <div>
                <table style={{ margin: 'auto' }}>
                  <thead>
                    <tr>
                      <th style={{
                        fontWeight: 'normal',
                        fontSize: '1em',
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e5e5e5',
                        backgroundColor: '#F2F2F2',
                      }}>
                        <input
                          type="checkbox"
                          onChange={() => handleSelectAll(files.uploading.concat(files.uploaded))}
                          checked={selectedFiles.length === files.uploading.length + files.uploaded.length}
                        />
                      </th>
                      <th style={{
                        fontWeight: 'normal',
                        fontSize: '1em',
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e5e5e5',
                        backgroundColor: '#F2F2F2',
                      }}>File Name</th>
                      <th style={{
                        fontWeight: 'normal',
                        fontSize: '1em',
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e5e5e5',
                        backgroundColor: '#F2F2F2',
                      }}>File Type</th>
                      <th style={{
                        fontWeight: 'normal',
                        fontSize: '1em',
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e5e5e5',
                        backgroundColor: '#F2F2F2',
                      }}>Status</th>
                      {/* <th style={{
                    fontWeight: 'normal',
                    fontSize: '1em',
                    padding: '8px',
                    textAlign: 'left',
                    borderBottom: '2px solid #e5e5e5',
                    backgroundColor: '#F2F2F2',
                  }}>File Preview</th> */}
                      <th style={{
                        fontWeight: 'normal',
                        fontSize: '1em',
                        padding: '18px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e5e5e5',
                        backgroundColor: '#F2F2F2',
                      }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.uploading.map((file, idx) => (
                      console.log('Uploading File:', file),
                      <tr key={`${idx}-${file.name}`}>
                        <td style={{
                          padding: '16px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>
                          <input
                            type="checkbox"
                            onChange={() => handleFileSelect(file)}
                            checked={selectedFiles.includes(file)}
                          />
                        </td>
                        <td style={{
                          padding: '16px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>{file.name}</td>
                        <td style={{
                          padding: '16px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>{getFileExtension(file.name)}</td>
                        <td style={{
                          padding: '16px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>
                          <span className={importClass.elem("file-status").mod({ uploading: true })} />
                        </td>
                        {/* <td style={{
                      padding: '8px',
                      borderBottom: '1px solid #e5e5e5',
                      textAlign: 'left',
                    }}><FilePreview file={{ name: file.name, url: URL.createObjectURL(file) }} /></td> */}
                        <td style={{
                          padding: '0px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>
                          {/* {selectedFiles.includes(file) && (
                          <button onClick={() => handleDeleteFile(file)}>Delete</button>
                        )} */}
                          {selectedFiles.includes(file) ? (
                            <button
                              onClick={() => handleDeleteFile(file)}
                              className="button-active"
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              disabled
                              className="button-inactive"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {files.uploaded.map(file => (
                      console.log('Uploaded File:', file),
                      <tr key={file.file}>
                        <td style={{
                          padding: '16px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>
                          <input
                            type="checkbox"
                            onChange={() => handleFileSelect(file)}
                            checked={selectedFiles.includes(file)}
                          />
                        </td>
                        <td style={{
                          padding: '16px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>{file.file}</td>
                        <td style={{
                          padding: '16px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>{getFileExtension(file.file)}</td>
                        <td style={{
                          padding: '16px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>Imported</td>
                        {/* <td style={{
                      padding: '8px',
                      borderBottom: '1px solid #e5e5e5',
                      textAlign: 'left',
                    }}><FilePreview file={{ name: file.name, url: file instanceof File ? URL.createObjectURL(file) : '' }} /></td> */}
                        <td style={{
                          padding: '0px',
                          borderBottom: '1px solid #e5e5e5',
                          textAlign: 'left',
                        }}>
                          {/* {selectedFiles.includes(file) && (
                          <button onClick={() => handleDeleteFile(file)}>Delete</button>
                        )} */}
                          {selectedFiles.includes(file) ? (
                            <button
                              onClick={() => handleDeleteFile(file)}

                              style={{
                                cursor: 'pointer',
                                color: 'red',
                                borderColor: 'red',
                              }}
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              disabled

                              style={{
                                cursor: 'not-allowed',
                                color: '#a9a9a9',
                                borderColor: '#a9a9a9',
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>
              </div>
            </div>
          )}
        </Upload>
      </main>

      {/* <Footer /> */}
    </div>
  );
};