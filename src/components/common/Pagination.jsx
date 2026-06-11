import React from 'react';
import RcPagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import { Select } from '../ui/Select.jsx';
import { useI18n } from '../../plugins/i18n/index.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
    const { t } = useI18n();

    const handlePageSizeChange = (val) => {
        onPageSizeChange(Number(val));
    };

    const handleJump = (e) => {
        if (e.key === 'Enter') {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= Math.ceil(total / pageSize)) {
                onPageChange(val);
                e.target.value = '';
            }
        }
    };
    
    // Custom item render for prev/next arrows
    const itemRender = (current, type, element) => {
        if (type === 'prev') {
            return <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />;
        }
        if (type === 'next') {
            return <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />;
        }
        return element;
    };

    return (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none">
            {/* Left: Page Size Selector */}
            <div className="flex items-center gap-2">
                <Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    options={[
                        { value: 5, label: `5 / ${t('page') || 'page'}` },
                        { value: 10, label: `10 / ${t('page') || 'page'}` },
                        { value: 20, label: `20 / ${t('page') || 'page'}` },
                        { value: 50, label: `50 / ${t('page') || 'page'}` },
                        { value: 100, label: `100 / ${t('page') || 'page'}` },
                    ]}
                    className="min-w-[120px] text-xs"
                    menuPlacement="top"
                />
            </div>

            {/* Center: Pagination */}
            <div className="custom-pagination">
                <RcPagination
                    current={page}
                    total={total}
                    pageSize={pageSize}
                    onChange={onPageChange}
                    itemRender={itemRender}
                    showTitle={false}
                />
            </div>

            {/* Right: Jumper and Total */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <span>{t('goTo') || 'Go to'}</span>
                    <input
                        type="number"
                        className="w-12 h-9 px-2 border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        onKeyDown={handleJump}
                        placeholder={page}
                    />
                </div>
                <div>
                    {t('total') || 'Total'} {total}
                </div>
            </div>

            <style>{`
                .custom-pagination .rc-pagination {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    border: none;
                    background: transparent;
                    padding: 0;
                    font-family: inherit;
                }
                .custom-pagination .rc-pagination-item,
                .custom-pagination .rc-pagination-prev,
                .custom-pagination .rc-pagination-next {
                    min-width: 32px;
                    height: 32px;
                    line-height: 30px;
                    border: 1px solid var(--border-color, #e5e7eb);
                    background-color: var(--bg-color, #fff);
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 0;
                    text-align: center;
                    font-size: 14px;
                    color: var(--text-color, #374151);
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                :global(.dark) .custom-pagination .rc-pagination-item,
                :global(.dark) .custom-pagination .rc-pagination-prev,
                :global(.dark) .custom-pagination .rc-pagination-next {
                    --border-color: rgba(55, 65, 81, 0.5);
                    --bg-color: #1F2937;
                    --text-color: #D1D5DB;
                }
                html.dark .custom-pagination .rc-pagination-item,
                html.dark .custom-pagination .rc-pagination-prev,
                html.dark .custom-pagination .rc-pagination-next {
                    border: 1px solid rgba(55, 65, 81, 0.5);
                    background-color: #1F2937;
                    color: #D1D5DB;
                }
                .custom-pagination .rc-pagination-item a,
                .custom-pagination .rc-pagination-jump-prev a,
                .custom-pagination .rc-pagination-jump-next a {
                    color: inherit;
                    text-decoration: none;
                }
                .custom-pagination .rc-pagination-item:hover,
                .custom-pagination .rc-pagination-prev:hover,
                .custom-pagination .rc-pagination-next:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                }
                .custom-pagination .rc-pagination-item-active {
                    background-color: #3b82f6;
                    border-color: #3b82f6;
                    color: #fff !important;
                }
                html.dark .custom-pagination .rc-pagination-item-active {
                    background-color: #3b82f6 !important;
                    border-color: #3b82f6 !important;
                    color: #fff !important;
                }
                html.dark .custom-pagination .rc-pagination-item-active a {
                    color: #fff !important;
                }
                .custom-pagination .rc-pagination-item-active a {
                    color: #fff;
                }
                .custom-pagination .rc-pagination-item-active:hover {
                    color: #fff;
                }
                .custom-pagination .rc-pagination-disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background-color: #f9fafb;
                }
                html.dark .custom-pagination .rc-pagination-disabled {
                    background-color: #374151;
                    border-color: #4B5563;
                }
                .custom-pagination .rc-pagination-disabled:hover {
                    border-color: var(--border-color, #e5e7eb);
                    color: #9ca3af;
                }
                html.dark .custom-pagination .rc-pagination-disabled:hover {
                    border-color: #4B5563;
                }
                .custom-pagination .rc-pagination-jump-prev,
                .custom-pagination .rc-pagination-jump-next {
                    min-width: 32px;
                    height: 32px;
                    line-height: 32px;
                    color: #9ca3af;
                    font-size: 12px;
                    cursor: pointer;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
