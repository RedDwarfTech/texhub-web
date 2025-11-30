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
            name: t('doc_category_getting_started'),
            show: true,
            subCategories: [
                { id: 'basics', name: t('doc_subcategory_basics'), show: true },
                { id: 'first-doc', name: t('doc_subcategory_first_doc'), show: false }
            ]
        },
        { 
            id: 'tutorials', 
            name: t('doc_category_tutorials'),
            show: false,
            subCategories: [
                { id: 'video-tutorials', name: t('doc_subcategory_video_tutorials'), show: true },
                { id: 'text-tutorials', name: t('doc_subcategory_text_tutorials'), show: true },
                { id: 'examples', name: t('doc_subcategory_examples'), show: true }
            ]
        },
        { 
            id: 'tools', 
            name: t('doc_category_tools'),
            show: false,
            subCategories: [
                { id: 'online-editors', name: t('doc_subcategory_online_editors'), show: true },
                { id: 'formula-tools', name: t('doc_subcategory_formula_tools'), show: true },
                { id: 'table-tools', name: t('doc_subcategory_table_tools'), show: true }
            ]
        },
        { 
            id: 'advanced', 
            name: t('doc_category_advanced'),
            show: false,
            subCategories: [
                { id: 'packages', name: t('doc_subcategory_packages'), show: true },
                { id: 'customization', name: t('doc_subcategory_customization'), show: true },
                { id: 'troubleshooting', name: t('doc_subcategory_troubleshooting'), show: true }
            ]
        }
    ];

    const docLinks = {
        'basics': [
            {
                title: t('doc_link_lshort'),
                url: "https://texdoc.org/serve/lshort-zh-cn.pdf/0",
                description: t('doc_link_lshort_desc'),
                show: true
            },
            {
                title: t('doc_link_latex_tutorial'),
                url: "https://www.latex-tutorial.com/",
                description: t('doc_link_latex_tutorial_desc'),
                show: true
            }
        ],
        'first-doc': [
            {
                title: t('doc_link_first_doc'),
                url: "https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes",
                description: t('doc_link_first_doc_desc'),
                show: true
            },
            {
                title: t('doc_link_doc_structure'),
                url: "https://www.latex-tutorial.com/tutorials/first-document/",
                description: t('doc_link_doc_structure_desc'),
                show: true
            }
        ],
        'video-tutorials': [
            {
                title: t('doc_link_bilibili_tutorials'),
                url: "https://search.bilibili.com/all?vt=70768055&keyword=LaTeX%E6%95%99%E7%A8%8B&from_source=webtop_search&spm_id_from=&search_source=5",
                description: t('doc_link_bilibili_tutorials_desc'),
                show: true
            },
            {
                title: t('doc_link_youtube_tutorials'),
                url: "https://www.youtube.com/results?search_query=latex+tutorial",
                description: t('doc_link_youtube_tutorials_desc'),
                show: true
            }
        ],
        'text-tutorials': [
            {
                title: t('doc_link_text_tutorial'),
                url: "https://www.latex-tutorial.com/",
                description: t('doc_link_text_tutorial_desc'),
                show: true
            },
            {
                title: t('doc_link_reference_manual'),
                url: "https://ctan.org/pkg/lshort",
                description: t('doc_link_reference_manual_desc'),
                show: true
            }
        ],
        'examples': [
            {
                title: t('doc_link_overleaf_learn'),
                url: "https://www.overleaf.com/learn",
                description: t('doc_link_overleaf_learn_desc'),
                show: true
            },
            {
                title: t('doc_link_overleaf_gallery'),
                url: "https://www.overleaf.com/gallery",
                description: t('doc_link_overleaf_gallery_desc'),
                show: true
            }
        ],
        'online-editors': [
            {
                title: t('doc_link_overleaf'),
                url: "https://www.overleaf.com/",
                description: t('doc_link_overleaf_desc'),
                show: true
            },
            {
                title: t('doc_link_texstudio'),
                url: "https://www.texstudio.org/",
                description: t('doc_link_texstudio_desc'),
                show: true
            }
        ],
        'formula-tools': [
            {
                title: t('doc_link_latexlive'),
                url: "https://www.latexlive.com/home",
                description: t('doc_link_latexlive_desc'),
                show: true
            },
            {
                title: t('doc_link_mathjax'),
                url: "https://www.mathjax.org/",
                description: t('doc_link_mathjax_desc'),
                show: true
            }
        ],
        'table-tools': [
            {
                title: t('doc_link_tablesgenerator'),
                url: "https://www.tablesgenerator.com/",
                description: t('doc_link_tablesgenerator_desc'),
                show: true
            },
            {
                title: t('doc_link_excel2latex'),
                url: "https://ctan.org/pkg/excel2latex",
                description: t('doc_link_excel2latex_desc'),
                show: true
            }
        ],
        'packages': [
            {
                title: t('doc_link_ctan'),
                url: "https://ctan.org/",
                description: t('doc_link_ctan_desc'),
                show: true
            },
            {
                title: t('doc_link_packages_guide'),
                url: "https://www.latex-tutorial.com/packages/",
                description: t('doc_link_packages_guide_desc'),
                show: true
            }
        ],
        'customization': [
            {
                title: t('doc_link_customization'),
                url: "https://www.latex-tutorial.com/customization/",
                description: t('doc_link_customization_desc'),
                show: true
            },
            {
                title: t('doc_link_style_files'),
                url: "https://ctan.org/topic/style",
                description: t('doc_link_style_files_desc'),
                show: true
            }
        ],
        'troubleshooting': [
            {
                title: t('doc_link_tex_stackexchange'),
                url: "https://tex.stackexchange.com/",
                description: t('doc_link_tex_stackexchange_desc'),
                show: true
            },
            {
                title: t('doc_link_troubleshooting'),
                url: "https://www.latex-tutorial.com/troubleshooting/",
                description: t('doc_link_troubleshooting_desc'),
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
                                <h6>{t('doc_center_title')}</h6>
                                <p>{t('doc_center_no_docs')}</p>
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
                    <div className={styles.sidebarTitle}>{t('doc_center_sidebar_title')}</div>
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
                            <h6>{t('doc_center_title')}</h6>
                            <p>{t('doc_center_intro')}</p>
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
                                <p>{t('doc_center_no_content')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocCenter;