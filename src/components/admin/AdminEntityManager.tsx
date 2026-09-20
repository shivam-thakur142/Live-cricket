import { useState, type ReactNode } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";

interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
}

interface AdminEntityManagerProps<T extends { id: string }> {
  title: string;
  items: T[];
  columns: Column<T>[];
  onAdd: (data: Record<string, unknown>) => void;
  onEdit: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  renderForm: (props: {
    initial?: Partial<T>;
    onSubmit: (data: Record<string, unknown>) => void;
    onCancel: () => void;
  }) => ReactNode;
}

export function AdminEntityManager<T extends { id: string }>({
  title,
  items,
  columns,
  onAdd,
  onEdit,
  onDelete,
  renderForm,
}: AdminEntityManagerProps<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | undefined>();

  const openAdd = () => {
    setEditingItem(undefined);
    setModalOpen(true);
  };

  const openEdit = (item: T) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(undefined);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>{title}</h1>
        <Button onClick={openAdd}><Plus size={18} /> Add</Button>
      </div>

      <div className="table-scroll">
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell header key={idx}>{col.header}</TableCell>
              ))}
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                {columns.map((col, idx) => (
                  <TableCell key={idx}>{col.render(item)}</TableCell>
                ))}
                <TableCell>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(item)} type="button" aria-label="Edit">
                      <Pencil size={18} />
                    </button>
                    <button className="icon-btn danger" onClick={() => onDelete(item.id)} type="button" aria-label="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
        size="lg"
      >
        {renderForm({
          initial: editingItem,
          onSubmit: (data) => {
            if (editingItem) {
              onEdit(editingItem.id, data);
            } else {
              onAdd(data);
            }
            closeModal();
          },
          onCancel: closeModal,
        })}
      </Modal>
    </div>
  );
}
