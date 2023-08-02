import React, { useRef } from 'react';
import styles from './App.module.css';
import { ReactComponent as HiddenContent } from "@/assets/expert/hidden-content.svg";
import { FileOutlined, FolderOutlined, RightOutlined } from '@ant-design/icons';
import CvCodeEditor from '@/component/common/editor/CvCodeEditor';
import TexHeader from '@/component/header/TexHeader';

const App: React.FC = () => {

  const divRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    resizeLeft("hiddenContentLeft", "prjTree");
    resizeRight("hiddenContentRight", "editor");
  }, []);

  const resizeLeft = (resizeBarName: string, resizeArea: string) => {
    setTimeout(() => {
      let prevCursorOffset = -1;
      let resizing = false;
      const menu: any = document.getElementById(resizeArea);
      const resizeBar: any = document.getElementById(resizeBarName);
      if(resizeBar != null) {
        resizeBar.addEventListener("mousedown", () => {
          resizing = true
        });
      }
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
      if(resizeBar !== null){
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

  const renderPrjTree = () => {

  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TexHeader></TexHeader>
      </div>
      <div className={styles.editorBody}>
        <div id="prjTree" ref={divRef} className={styles.prjTree}>
          <div className={styles.treeItem}>
            <div className={styles.folderArrow}><RightOutlined /></div>
            <div><FolderOutlined /></div>
            <div>image</div>
          </div>
          <div className={styles.treeItem}>
            <div className={styles.folderArrow}></div>
            <div><FileOutlined /></div>
            <div>modern.tex</div>
          </div>
        </div>
        <div>
          <HiddenContent id="hiddenContentLeft" className={styles.hiddenContent} />
        </div>
        <div id="editor" className={styles.editor}>
          <CvCodeEditor></CvCodeEditor>
        </div>
        <div>
          <HiddenContent id="hiddenContentRight" className={styles.hiddenContent} />
        </div>
        <div id="preview" className={styles.preview}>preview</div>
      </div>
    </div>
  );
}

export default App;