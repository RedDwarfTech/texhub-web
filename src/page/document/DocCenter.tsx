import TexHeader from "@/component/header/TexHeader";
import styles from "./DocCenter.module.css";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";

const DocCenter: React.FC = () => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('getting-started');
    const [activeSubCategory, setActiveSubCategory] = useState('basics');

    const docCategories = [
        { 
            id: 'getting-started', 
            name: '快速开始',
            show: true,
            subCategories: [
                { id: 'basics', name: '基础知识', show: true },
                { id: 'first-doc', name: '第一个文档', show: false }
            ]
        },
        { 
            id: 'tutorials', 
            name: '教程指南',
            show: false,
            subCategories: [
                { id: 'video-tutorials', name: '视频教程', show: true },
                { id: 'text-tutorials', name: '文字教程', show: true },
                { id: 'examples', name: '实战案例', show: true }
            ]
        },
        { 
            id: 'tools', 
            name: '工具资源',
            show: false,
            subCategories: [
                { id: 'online-editors', name: '在线编辑器', show: true },
                { id: 'formula-tools', name: '公式工具', show: true },
                { id: 'table-tools', name: '表格工具', show: true }
            ]
        },
        { 
            id: 'advanced', 
            name: '高级主题',
            show: false,
            subCategories: [
                { id: 'packages', name: '包管理', show: true },
                { id: 'customization', name: '自定义', show: true },
                { id: 'troubleshooting', name: '问题解决', show: true }
            ]
        }
    ];

    const docLinks = {
        'basics': [
            {
                title: "一份不太简短的LaTeX介绍",
                url: "https://texdoc.org/serve/lshort-zh-cn.pdf/0",
                description: "LaTeX入门必读文档，从基础语法到高级技巧的完整指南",
                show: true
            },
            {
                title: "LaTeX基础教程",
                url: "https://www.latex-tutorial.com/",
                description: "系统性的LaTeX学习教程，适合初学者",
                show: true
            }
        ],
        'first-doc': [
            {
                title: "创建第一个LaTeX文档",
                url: "https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes",
                description: "30分钟学会创建第一个LaTeX文档",
                show: true
            },
            {
                title: "LaTeX文档结构",
                url: "https://www.latex-tutorial.com/tutorials/first-document/",
                description: "了解LaTeX文档的基本结构和组成部分",
                show: true
            }
        ],
        'video-tutorials': [
            {
                title: "LaTeX视频教程",
                url: "https://search.bilibili.com/all?vt=70768055&keyword=LaTeX%E6%95%99%E7%A8%8B&from_source=webtop_search&spm_id_from=&search_source=5",
                description: "B站精选LaTeX视频教程，从入门到精通",
                show: true
            },
            {
                title: "LaTeX实战视频",
                url: "https://www.youtube.com/results?search_query=latex+tutorial",
                description: "YouTube上的优质LaTeX视频教程",
                show: true
            }
        ],
        'text-tutorials': [
            {
                title: "LaTeX文字教程",
                url: "https://www.latex-tutorial.com/",
                description: "系统性的LaTeX文字教程，适合自学",
                show: true
            },
            {
                title: "LaTeX参考手册",
                url: "https://ctan.org/pkg/lshort",
                description: "LaTeX官方参考手册中文版",
                show: true
            }
        ],
        'examples': [
            {
                title: "LaTeX实战案例",
                url: "https://www.overleaf.com/learn",
                description: "Overleaf官方教程，包含大量实用案例",
                show: true
            },
            {
                title: "LaTeX模板库",
                url: "https://www.overleaf.com/gallery",
                description: "丰富的LaTeX模板和示例",
                show: true
            }
        ],
        'online-editors': [
            {
                title: "Overleaf 在线编辑器",
                url: "https://www.overleaf.com/",
                description: "最受欢迎的在线LaTeX编辑器，支持实时协作",
                show: true
            },
            {
                title: "TeXstudio 在线版",
                url: "https://www.texstudio.org/",
                description: "功能强大的LaTeX编辑器在线版本",
                show: true
            }
        ],
        'formula-tools': [
            {
                title: "LaTeX公式设计器",
                url: "https://www.latexlive.com/home",
                description: "在线LaTeX公式编辑器，可视化编辑数学公式",
                show: true
            },
            {
                title: "MathJax 公式预览",
                url: "https://www.mathjax.org/",
                description: "实时预览LaTeX数学公式",
                show: true
            }
        ],
        'table-tools': [
            {
                title: "LaTeX表格生成器",
                url: "https://www.tablesgenerator.com/",
                description: "在线表格生成工具，快速创建LaTeX表格代码",
                show: true
            },
            {
                title: "Excel2LaTeX",
                url: "https://ctan.org/pkg/excel2latex",
                description: "Excel表格转换为LaTeX代码的工具",
                show: true
            }
        ],
        'packages': [
            {
                title: "LaTeX包文档",
                url: "https://ctan.org/",
                description: "CTAN官方包文档，查找各种LaTeX包的使用方法",
                show: true
            },
            {
                title: "常用LaTeX包指南",
                url: "https://www.latex-tutorial.com/packages/",
                description: "介绍最常用的LaTeX包及其使用方法",
                show: true
            }
        ],
        'customization': [
            {
                title: "LaTeX自定义指南",
                url: "https://www.latex-tutorial.com/customization/",
                description: "如何自定义LaTeX文档的样式和格式",
                show: true
            },
            {
                title: "LaTeX样式文件",
                url: "https://ctan.org/topic/style",
                description: "各种LaTeX样式文件和模板",
                show: true
            }
        ],
        'troubleshooting': [
            {
                title: "LaTeX高级技巧",
                url: "https://tex.stackexchange.com/",
                description: "TeX Stack Exchange社区，解决LaTeX疑难问题",
                show: true
            },
            {
                title: "常见LaTeX错误",
                url: "https://www.latex-tutorial.com/troubleshooting/",
                description: "LaTeX常见错误及解决方案",
                show: true
            }
        ]
    };

    // 过滤显示的分类
    const visibleCategories = docCategories.filter(category => category.show);
    
    const currentCategory = visibleCategories.find(cat => cat.id === activeCategory);
    const currentLinks = docLinks[activeSubCategory as keyof typeof docLinks] || [];
    
    // 过滤显示的链接
    const visibleLinks = currentLinks.filter(link => link.show);

    const handleCategoryClick = (categoryId: string) => {
        setActiveCategory(categoryId);
        const category = visibleCategories.find(cat => cat.id === categoryId);
        if (category && category.subCategories.length > 0) {
            const visibleSubCategories = category.subCategories.filter(sub => sub.show);
            if (visibleSubCategories.length > 0) {
                setActiveSubCategory(visibleSubCategories[0].id);
            }
        }
    };

    // 如果没有可见的分类，显示默认内容
    if (visibleCategories.length === 0) {
        return (
            <div>
                <TexHeader></TexHeader>
                <div className={styles.docBody}>
                    <div className={styles.docMain}>
                        <div className={styles.docContainer}>
                            <div className={styles.docItem}>
                                <h6>TeXHub 文档中心</h6>
                                <p>暂无可用文档，请联系管理员。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.docBody}>
                <div className={styles.docSidebar}>
                    <div className={styles.sidebarTitle}>目录</div>
                    <ul className={styles.sidebarNav}>
                        {visibleCategories.map((category) => {
                            const visibleSubCategories = category.subCategories.filter(sub => sub.show);
                            return (
                                <li key={category.id}>
                                    <div 
                                        className={`${styles.sidebarNavItem} ${activeCategory === category.id ? styles.active : ''}`}
                                        onClick={() => handleCategoryClick(category.id)}
                                    >
                                        {category.name}
                                    </div>
                                    {activeCategory === category.id && visibleSubCategories.length > 0 && (
                                        <ul className={styles.subNav}>
                                            {visibleSubCategories.map((subCat) => (
                                                <li key={subCat.id}>
                                                    <div 
                                                        className={`${styles.subNavItem} ${activeSubCategory === subCat.id ? styles.active : ''}`}
                                                        onClick={() => setActiveSubCategory(subCat.id)}
                                                    >
                                                        {subCat.name}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                
                <div className={styles.docMain}>
                    <div className={styles.docContainer}>
                        <div className={styles.docItem}>
                            <h6>TeXHub 文档中心</h6>
                            <p>在这里找到LaTeX学习和使用的优质资源，从入门到精通的全方位指南。</p>
                        </div>
                        
                        {visibleLinks.length > 0 ? (
                            <div className={styles.docLinks}>
                                {visibleLinks.map((link, index) => (
                                    <a 
                                        key={index}
                                        target="_blank" 
                                        rel="noreferrer" 
                                        href={link.url}
                                        className={styles.docLinkCard}
                                    >
                                        <div className={styles.docLinkTitle}>{link.title}</div>
                                        <div className={styles.docLinkDesc}>{link.description}</div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noContent}>
                                <p>该分类暂无可用内容。</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocCenter;