import type { Member } from '~/types';

import { Link } from '@tanstack/react-router';
import { config } from 'config';
import type { TFunction } from 'i18next';
import { dateShort } from '~/lib/utils';
import { AvatarWrap } from '~/modules/common/avatar-wrap';
import CheckboxColumn from '~/modules/common/data-table/checkbox-column';
import type { ColumnOrColumnGroup } from '~/modules/common/data-table/columns-view';
import HeaderCell from '~/modules/common/data-table/header-cell';
import { renderSelect } from '~/modules/common/data-table/select-column';
import { openUserPreviewSheet } from '~/modules/users/users-table/columns';

export const useColumns = (t: TFunction<'translation', undefined>, isMobile: boolean, isAdmin: boolean, isSheet: boolean) => {
  const mobileColumns: ColumnOrColumnGroup<Member>[] = [
    {
      key: 'name',
      name: t('common:name'),
      visible: true,
      sortable: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row, tabIndex }) => (
        <Link
          to="/user/$idOrSlug"
          tabIndex={tabIndex}
          params={{ idOrSlug: row.slug }}
          className="flex space-x-2 items-center outline-0 ring-0 group"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            openUserPreviewSheet(row);
          }}
        >
          <AvatarWrap type="user" className="h-8 w-8" id={row.id} name={row.name} url={row.thumbnailUrl} />
          <span className="group-hover:underline underline-offset-4 truncate font-medium">{row.name || '-'}</span>
        </Link>
      ),
    },
  ];
  const columns: ColumnOrColumnGroup<Member>[] = [
    {
      key: 'email',
      name: t('common:email'),
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      minWidth: 140,
      renderCell: ({ row, tabIndex }) => {
        return (
          <a href={`mailto:${row.email}`} tabIndex={tabIndex} className="truncate hover:underline underline-offset-4 outline-0 ring-0 font-light">
            {row.email || '-'}
          </a>
        );
      },
    },
    {
      key: 'role',
      name: t('common:role'),
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => t(row.membership.role),
      width: 100,
      ...(isAdmin && {
        renderEditCell: ({ row, onRowChange }) =>
          renderSelect({
            row,
            onRowChange,
            options: config.rolesByType.entityRoles,
          }),
      }),
    },
    {
      key: 'createdAt',
      name: t('common:created_at'),
      sortable: true,
      visible: !isSheet,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => dateShort(row.createdAt),
      minWidth: 180,
    },
    {
      key: 'lastSeenAt',
      name: t('common:last_seen_at'),
      sortable: true,
      visible: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row }) => dateShort(row.lastSeenAt),
      minWidth: 180,
    },
  ];

  if (isAdmin) mobileColumns.unshift(CheckboxColumn);

  return isMobile ? mobileColumns : [...mobileColumns, ...columns];
};
