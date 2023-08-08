import React, { useRef, useState } from 'react';
import styles from './App.module.css';
import { ReactComponent as HiddenContent } from "@/assets/expert/hidden-content.svg";
const CvCodeEditor = React.lazy(() => import('@/component/common/editor/CvCodeEditor'));
import TexHeader from '@/component/header/TexHeader';
import { useLocation } from 'react-router-dom';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import { TexFileModel } from '@/model/file/TexFileModel';
import { addFile, getFileList } from '@/service/file/FileService';
import { Modal, Tree } from 'antd';
import type { DataNode, DirectoryTreeProps } from 'antd/es/tree';
import { FileAddOutlined, FolderAddOutlined } from "@ant-design/icons";

const { DirectoryTree } = Tree;
const App: React.FC = () => {

  const divRef = useRef<HTMLDivElement>(null);
  const { state } = useLocation();
  const { projectId } = state;
  const { fileTree } = useSelector((state: AppState) => state.file);
  const [texFileTree, setTexFileTree] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    resizeLeft("hiddenContentLeft", "prjTree");
    resizeRight("hiddenContentRight", "editor");
    getFileList(projectId);
  }, []);

  React.useEffect(() => {
    if (fileTree && fileTree.length > 0) {
      setTexFileTree(fileTree);
    }
  }, [fileTree]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    let params = {
      name: "demo",
      project_id: projectId,
      parent: projectId,
      file_type: 1
    };
    addFile(params);
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

  const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
    console.log('Trigger Select', keys, info);
  };

  const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
    console.log('Trigger Expand', keys, info);
  };

  const handleFileAdd = () => {
    setIsModalOpen(true);
  }

  return (
    <div className={styles.container}>
      <TexHeader></TexHeader>
      <div className={styles.editorBody}>
        <div id="prjTree" ref={divRef} className={styles.prjTree}>
          <div className={styles.treeMenus}>
            <button onClick={() => { handleFileAdd() }}><FileAddOutlined /></button>
            <button><FolderAddOutlined /></button>
          </div>
          <div>
            <DirectoryTree
              multiple
              defaultExpandAll
              onSelect={onSelect}
              onExpand={onExpand}
              treeData={texFileTree}
              fieldNames={
                { title: 'name', key: 'file_id' }
              }
            />
          </div>
        </div>
        <div>
          <HiddenContent id="hiddenContentLeft" className={styles.hiddenContent} />
        </div>
        <div id="editor" className={styles.editor}>
          <React.Suspense fallback={<div>Loading...</div>}>
            <CvCodeEditor projectId={projectId} docId={''}></CvCodeEditor>
          </React.Suspense>
        </div>
        <div>
          <HiddenContent id="hiddenContentRight" className={styles.hiddenContent} />
        </div>
        <div id="preview" className={styles.preview}>preview</div>
      </div>
      <Modal title="创建" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <input placeholder="名称"></input>
      </Modal>
    </div>
  );
}

export default App;