'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: {
    loading: boolean;
    total: number;
    limit: number;
    pages: number;
    page: number;
  };
  switchPage?: (page: number) => void;
  switchLimit?: (limit: number) => void;
  makeSearch?: (search: string) => void;
  reloadTable?: () => void;
  // orderBy?: (order: string) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  switchPage = (page: number) => page,
  switchLimit = (limit: number) => limit,
  makeSearch = (search: string) => search,
  // orderBy = (order: string) => order,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Debounce na pesquisa para evitar chamadas excessivas à API
  // Utiliza um timeout para aguardar 2 segundos antes de fazer a busca
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [searchDebounced, setSearchDebounced] = useState<string>('');
  const debSearch = (value: string) => {
    setSearchDebounced(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      makeSearch(value);
    }, 1000); //1 segundos
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select defaultValue="10" onValueChange={(value) => switchLimit(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Limite" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            type="text"
            placeholder="Pesquisar..."
            value={searchDebounced}
            onChange={(e) => debSearch(e.target.value)}
            className="input input-bordered focus:border-primary focus:ring-primary w-full max-w-xs rounded-md border px-3 py-1"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!pagination.loading ? (
              <>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col items-center justify-between space-x-2 py-4 lg:flex-row">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground text-sm">
            Página {pagination.page} de {pagination.pages}
          </span>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          {table.getRowModel().rows.length > 0 &&
            table.getRowModel().rows.length < pagination.total && (
              <>
                <Button
                  className="pointer z-10"
                  variant="outline"
                  size="sm"
                  onClick={() => switchPage(1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft />
                </Button>
                <Button
                  className="pointer z-10"
                  variant="outline"
                  size="sm"
                  onClick={() => switchPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  className="pointer z-10"
                  variant="outline"
                  size="sm"
                  onClick={() => switchPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight />
                </Button>
                <Button
                  className="pointer z-10"
                  variant="outline"
                  size="sm"
                  onClick={() => switchPage(pagination.pages)}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronsRight />
                </Button>
              </>
            )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground text-sm">
            Mostrando {table.getRowModel().rows.length} de {pagination.total} resultados
          </span>
        </div>
      </div>
    </>
  );
}
