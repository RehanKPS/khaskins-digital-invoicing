import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2, Package, FolderOpen } from 'lucide-react';
import { formatAmount } from '@/lib/format';

const emptyProduct: Omit<Product, 'id'> = {
  name: '', standardPrice: 0, status: 'Active', category: '',
};

const ProductsPage = () => {
  const { toast } = useToast();
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory } = useData();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);

  // Category form
  const [catName, setCatName] = useState('');
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(emptyProduct); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, standardPrice: p.standardPrice, status: p.status, category: p.category || '' }); setModalOpen(true); };

  const handleSave = () => {
    if (!form.name || form.standardPrice < 0) {
      toast({ title: 'Required fields missing', variant: 'destructive' });
      return;
    }
    if (editing) {
      updateProduct(editing.id, form);
      toast({ title: 'Product updated!' });
    } else {
      addProduct(form);
      toast({ title: 'Product created!' });
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId);
      toast({ title: 'Product deleted.' });
      setDeleteId(null);
    }
  };

  const handleAddCategory = () => {
    if (!catName.trim()) return;
    if (categories.some(c => c.name.toLowerCase() === catName.trim().toLowerCase())) {
      toast({ title: 'Category already exists', variant: 'destructive' });
      return;
    }
    addCategory({ name: catName.trim().toUpperCase() });
    setCatName('');
    toast({ title: 'Category added!' });
  };

  const handleDeleteCategory = () => {
    if (deleteCatId) {
      deleteCategory(deleteCatId);
      toast({ title: 'Category deleted.' });
      setDeleteCatId(null);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCatModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
        </div>
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Categories</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No categories yet.</p>
              <Button onClick={() => setCatModalOpen(true)} className="mt-3" size="sm"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat, idx) => {
                    const count = products.filter(p => p.category === cat.name).length;
                    return (
                      <TableRow key={cat.id} className="hover:bg-muted/50">
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell><Badge variant="outline">{count}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteCatId(cat.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No products found. Add your first product.</p>
              <Button onClick={openCreate} className="mt-4"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category ? <Badge variant="outline">{p.category}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                      <TableCell className="text-right pkr-format whitespace-nowrap">{formatAmount(p.standardPrice)}</TableCell>
                      <TableCell><Badge className={p.status === 'Active' ? 'bg-[#16a34a] text-white hover:bg-[#16a34a]/90' : 'bg-[#dc2626] text-white hover:bg-[#dc2626]/90'}>{p.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Product Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Selling Price *</Label><Input type="number" value={form.standardPrice} onChange={e => setForm({ ...form, standardPrice: Number(e.target.value) })} /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category || '_none_'} onValueChange={v => setForm({ ...form, category: v === '_none_' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">— None —</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as 'Active' | 'Inactive' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Product?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Category Modal */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name *</Label>
              <Input value={catName} onChange={e => setCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategory()} placeholder="e.g. FINISHED LEATHER" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatModalOpen(false)}>Cancel</Button>
            <Button onClick={() => { handleAddCategory(); setCatModalOpen(false); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={!!deleteCatId} onOpenChange={() => setDeleteCatId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Category?</AlertDialogTitle><AlertDialogDescription>Products in this category won't be deleted but will lose their category assignment.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;
