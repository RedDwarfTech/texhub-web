import React, { useRef, useState } from 'react';
import styles from './App.module.css';
import { ReactComponent as HiddenContent } from "@/assets/expert/hidden-content.svg";
const CollarCodeEditor = React.lazy(() => import('@/component/common/editor/CollarCodeEditor'));
import { useLocation } from 'react-router-dom';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import { TexFileModel } from '@/model/file/TexFileModel';
import { addFile, chooseFile, delTreeItem, getFileList } from '@/service/file/FileService';
import { Button, Dropdown, MenuProps, Modal } from 'antd';
import { ExclamationCircleOutlined, FileAddOutlined, FolderAddOutlined, MoreOutlined } from "@ant-design/icons";
import { RequestHandler, ResponseHandler } from 'rdjs-wheel';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EHeader from '@/component/header/editor/EHeader';
import 'pdfjs-dist/web/pdf_viewer.css';
import { readConfig } from '@/config/app/config-reader';
import queryString from 'query-string';
import Previewer from '@/component/common/previewer/Previewer';
import { compileProject, getLatestCompile } from '@/service/project/ProjectService';

const App: React.FC = () => {

  const divRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const search = location.search;
  const params = queryString.parse(search);
  const pid = params.pid!;
  const { fileTree } = useSelector((state: AppState) => state.file);
  const { compileResult, latestComp } = useSelector((state: AppState) => state.proj);
  const [texFileTree, setTexFileTree] = useState<TexFileModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainFile, setMainFile] = useState<TexFileModel>();
  const [pdfUrl, setPdfUrl] = useState<string>();
  const { confirm } = Modal;

  React.useEffect(() => {
    resizeLeft("hiddenContentLeft", "prjTree");
    resizeRight("hiddenContentRight", "editor");
    if (pid) {
      getFileList(pid.toString()).then((res) => {
        if (ResponseHandler.responseSuccess(res)) {
          getLatestCompile(pid.toString());
        }
      });
    }
  }, []);

  React.useEffect(() => {
    if (fileTree && fileTree.length > 0) {
      setTexFileTree(fileTree);
      let defaultFile = fileTree.filter((file: TexFileModel) => file.main_flag === 1);
      setMainFile(defaultFile[0]);
    }
  }, [fileTree]);

  React.useEffect(() => {
    if (latestComp && Object.keys(latestComp).length > 0) {
      let pdfUrl = readConfig("compileBaseUrl") + "/" + latestComp.project_id + "/" + latestComp.path + "/main.pdf";
      setPdfUrl(pdfUrl);
    } else {
      compile(pid.toString(), "main.tex");
    }
  }, [latestComp]);

  React.useEffect(() => {
    if (!compileResult || Object.keys(compileResult).length === 0) {
      return;
    }
    let proj_id = compileResult.project_id;
    let vid = compileResult.out_path;
    if (proj_id && vid) {
      const pdfUrl = readConfig("compileBaseUrl") + "/" + proj_id + "/" + vid + "/main.pdf";
      setPdfUrl(pdfUrl);
    }
  }, [compileResult]);

  const compile = (prj_id: string, file_name: string) => {
    let params = {
      project_id: prj_id,
      req_time: new Date().getTime(),
      file_name: file_name
    };
    compileProject(params).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {

      } else {
        toast.error(resp.msg);
      }
    });
  }

  const handleOk = () => {
    setIsModalOpen(false);
    let params = {
      name: "demo",
      project_id: pid,
      parent: pid,
      file_type: 1
    };
    addFile(params).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        getFileList(pid?.toString());
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
            getFileList(pid.toString());
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
          <div className={styles.editorHeader}></div>
          <React.Suspense fallback={<div>Loading...</div>}>
            <CollarCodeEditor projectId={pid.toString()} docId={mainFile?.file_id!}></CollarCodeEditor>
          </React.Suspense>
          <div className={styles.editorFooter}></div>
        </div>
        <div>
          <HiddenContent id="hiddenContentRight" className={styles.hiddenContent} />
        </div>
        <Previewer pdfUrl={pdfUrl}></Previewer>
      </div>
      <Modal title="创建" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <input placeholder="名称"></input>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default App;