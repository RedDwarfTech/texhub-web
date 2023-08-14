import React, { useRef, useState } from 'react';
import styles from './App.module.css';
import { ReactComponent as HiddenContent } from "@/assets/expert/hidden-content.svg";
const CvCodeEditor = React.lazy(() => import('@/component/common/editor/CollarCodeEditor'));
import { useLocation } from 'react-router-dom';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import { TexFileModel } from '@/model/file/TexFileModel';
import { addFile, chooseFile, delTreeItem, getFileList } from '@/service/file/FileService';
import { Button, Dropdown, MenuProps, Modal } from 'antd';
import { ExclamationCircleOutlined, FileAddOutlined, FolderAddOutlined, MoreOutlined } from "@ant-design/icons";
import { ResponseHandler } from 'rdjs-wheel';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EHeader from '@/component/header/editor/EHeader';
import 'pdfjs-dist/web/pdf_viewer.css';
import { readConfig } from '@/config/app/config-reader';

const App: React.FC = () => {

  const divRef = useRef<HTMLDivElement>(null);
  const { state } = useLocation();
  const { projectId } = state;
  const { fileTree } = useSelector((state: AppState) => state.file);
  const [texFileTree, setTexFileTree] = useState<TexFileModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainFile, setMainFile] = useState<TexFileModel>();
  const canvasRef = useRef(null);
  const { confirm } = Modal;

  React.useEffect(() => {
    resizeLeft("hiddenContentLeft", "prjTree");
    resizeRight("hiddenContentRight", "editor");
    getFileList(projectId);
  }, []);

  React.useEffect(() => {
    if (fileTree && fileTree.length > 0) {
      setTexFileTree(fileTree);
      let defaultFile = fileTree.filter((file: TexFileModel) => file.main_flag === 1);
      setMainFile(defaultFile[0]);
      const pdfUrl = readConfig("compileBaseUrl") + "/" + defaultFile[0]?.project_id + "/" + defaultFile[0]?.name.split(".")[0] + ".pdf";
      initPdf(pdfUrl);
    }
  }, [fileTree]);

  const initPdf = async (pdfUrl: string) => {
    const pdfJS = await import('pdfjs-dist/build/pdf');
    pdfJS.GlobalWorkerOptions.workerSrc =
      window.location.origin + '/pdf.worker.min.js';
    const pdf = await pdfJS.getDocument(pdfUrl).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas: any = canvasRef.current;
    if (!canvas) return;
    const canvasContext = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = { canvasContext, viewport };
    const renderTask = page.render(renderContext);
    renderTask.promise.then(function () {
      const textContent = page.getTextContent();
      return textContent;
    }).then(function (textContent: string) {
      const textLayer = document.querySelector(".textLayer") as HTMLDivElement;
      textLayer.style.left = canvas.offsetLeft + 'px';
      textLayer.style.top = canvas.offsetTop + 'px';
      textLayer.style.height = canvas.offsetHeight + 'px';
      textLayer.style.width = canvas.offsetWidth + 'px';
      pdfJS.renderTextLayer({
        textContent: textContent,
        container: textLayer,
        viewport: viewport,
        textDivs: []
      });
    });
  }

  const handleOk = () => {
    setIsModalOpen(false);
    let params = {
      name: "demo",
      project_id: projectId,
      parent: projectId,
      file_type: 1
    };
    addFile(params).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        getFileList(projectId);
      }
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const resizeLeft = (resizeBarName: string, resizeArea: string) => {
    setTimeout(() => {
      let prevCursorOffset = -1;
      let resizing = false;
      const menu: any = document.getElementById(resizeArea);
      const resizeBar: any = document.getElementById(resizeBarName);
      if (resizeBar != null) {
        resizeBar.addEventListener("mousedown", () => {
          resizing = true
        });
      };
      window.addEventListener("mousemove", handleResizeMenu);
      window.addEventListener("mouseup", () => {
        resizing = false
      });

      function handleResizeMenu(e: any) {
        if (!resizing) {
          return
        }
        const { screenX } = e
        e.preventDefault()
        e.stopPropagation()
        if (prevCursorOffset === -1) {
          prevCursorOffset = screenX
        } else if (Math.abs(prevCursorOffset - screenX) >= 5) {
          menu.style.flex = `0 0 ${screenX}px`;
          menu.style.maxWidth = "100vw";
          prevCursorOffset = screenX;
        }
      }
    }, 1500);
  }

  const resizeRight = (resizeBarName: string, resizeArea: string) => {
    setTimeout(() => {
      let prevCursorOffset = -1;
      let resizing = false;
      const menu: HTMLElement | null = document.getElementById(resizeArea);
      const resizeBar: any = document.getElementById(resizeBarName);
      if (resizeBar !== null) {
        resizeBar.addEventListener("mousedown", () => {
          resizing = true
        });
      }
      window.addEventListener("mousemove", handleResizeMenu);
      window.addEventListener("mouseup", () => {
        resizing = false
      });

      function handleResizeMenu(e: any) {
        if (!resizing || menu == null) {
          return
        }
        if (!divRef.current) {
          return;
        }
        const prjTreeWidth = divRef.current.offsetWidth;
        const { screenX } = e
        e.preventDefault()
        e.stopPropagation()
        if (prevCursorOffset === -1) {
          prevCursorOffset = screenX
        } else if (Math.abs(prevCursorOffset - screenX) >= 5) {
          menu.style.flex = `0 0 ${screenX - prjTreeWidth}px`;
          menu.style.maxWidth = "100vw";
          prevCursorOffset = screenX;
        }
      }
    }, 1500);
  }

  const handleFileAdd = () => {
    setIsModalOpen(true);
  }

  const handleFileDelete = () => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: <div>删除后数据无法恢复，确定要删除？</div>,
      onOk() {
        let params = {
          file_id: mainFile
        };
        delTreeItem(params).then((resp) => {
          if (ResponseHandler.responseSuccess(resp)) {
            getFileList(projectId);
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a target="_blank" rel="noopener noreferrer" onClick={handleFileDelete}>
          删除
        </a>
      ),
    },
  ];

  const handleDropdownClick = (fileId: string) => {

  };

  const handleTreeItemClick = (fileItem: TexFileModel) => {
    let params = {
      file_id: fileItem.file_id
    };
    chooseFile(params);
  };

  const renderDirectoryTree = () => {
    if (!texFileTree) {
      return (<div></div>);
    }
    const tagList: JSX.Element[] = [];
    texFileTree.forEach((item: TexFileModel) => {
      tagList.push(
        <div key={item.file_id} className={styles.fileItem} onClick={() => handleTreeItemClick(item)}>
          <div>{item.name}</div>
          <div className={styles.actions}>
            <Dropdown menu={{ items }}
              onOpenChange={(visible) =>
                visible && handleDropdownClick(item.file_id)
              }
              placement="bottomLeft"
              arrow={{ pointAtCenter: true }}>
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        </div>
      );
    });
    return tagList;
  }

  if (!mainFile) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <EHeader></EHeader>
      <div className={styles.editorBody}>
        <div id="prjTree" ref={divRef} className={styles.prjTree}>
          <div className={styles.treeMenus}>
            <button onClick={() => { handleFileAdd() }}><FileAddOutlined /></button>
            <button><FolderAddOutlined /></button>
          </div>
          <div className={styles.treeBody}>
            {renderDirectoryTree()}
          </div>
        </div>
        <div>
          <HiddenContent id="hiddenContentLeft" className={styles.hiddenContent} />
        </div>
        <div id="editor" className={styles.editor}>
          <React.Suspense fallback={<div>Loading...</div>}>
            <CvCodeEditor projectId={projectId} docId={mainFile?.file_id!}></CvCodeEditor>
          </React.Suspense>
        </div>
        <div>
          <HiddenContent id="hiddenContentRight" className={styles.hiddenContent} />
        </div>
        <div id="preview" className={styles.preview}>
          <div className={styles.previewHader}>
          </div>
          <div className={styles.previewBody}>
            <div className={styles.cavasLayer}>
              <canvas ref={canvasRef} />
              <div className="textLayer"></div>
            </div>
            {/*https://stackoverflow.com/questions/33063213/pdf-js-with-text-selection*/}
            
          </div>
          <div className={styles.previewFooter}>

          </div>
        </div>
      </div>
      <Modal title="创建" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <input placeholder="名称"></input>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default App;