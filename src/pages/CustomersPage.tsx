import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Customer } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';

const PROVINCE_OPTIONS = [
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
  'Islamabad (ICT)', 'Azad Kashmir', 'Gilgit Baltistan',
];

const emptyCustomer: Omit<Customer, 'id'> = {
  companyName: '', ntn: '', strn: '', address: '', city: '', province: '', phone: '', email: '', status: 'Active',
};

const CustomersPage = () => {
  const { toast } = useToast();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyCustomer);

  const openCreate = () => { setEditing(null); setForm(emptyCustomer); setModalOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm(c); setModalOpen(true); };

  const handleSave = () => {
    if (!form.companyName || !form.ntn || !form.province) {
      toast({ title: 'Company Name, NTN, and Province are required', variant: 'destructive' });
      return;
    }
    if (editing) {
      updateCustomer(editing.id, form);
      toast({ title: 'Customer updated!' });
    } else {
      addCustomer(form);
      toast({ title: 'Customer created!' });
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCustomer(deleteId);
      toast({ title: 'Customer deleted.' });
      setDeleteId(null);
    }
  };

  const filtered = customers.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.ntn.includes(search) || c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Customer</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No customers yet. Add your first customer.</p>
              <Button onClick={openCreate} className="mt-4"><Plus className="w-4 h-4 mr-2" /> Add Customer</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>NTN</TableHead>
                    <TableHead>STRN</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{c.companyName}</TableCell>
                      <TableCell>{c.ntn}</TableCell>
                      <TableCell>{c.strn}</TableCell>
                      <TableCell>{c.city}</TableCell>
                      <TableCell>{c.province}</TableCell>
                      <TableCell><Badge className={c.status === 'Active' ? 'bg-[#16a34a] text-white hover:bg-[#16a34a]/90' : 'bg-[#dc2626] text-white hover:bg-[#dc2626]/90'}>{c.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2"><Label>Company Name *</Label><Input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} /></div>
            <div className="space-y-2"><Label>NTN Number *</Label><Input value={form.ntn} onChange={e => setForm({ ...form, ntn: e.target.value })} /></div>
            <div className="space-y-2"><Label>STRN Number</Label><Input value={form.strn} onChange={e => setForm({ ...form, strn: e.target.value })} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Province *</Label>
              <Select value={form.province} onValueChange={v => setForm({ ...form, province: v })}>
                <SelectTrigger><SelectValue placeholder="Select province..." /></SelectTrigger>
                <SelectContent>{PROVINCE_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Customer?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomersPage;
