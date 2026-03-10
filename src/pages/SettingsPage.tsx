import { useState } from 'react';
import { CompanySettings, BankSettings } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { getFbrApiUrl } from '@/services/fbrService';

const SettingsPage = () => {
  const { toast } = useToast();
  const { fbrSettings, setFbrSettings } = useData();

  const [compForm, setCompForm] = useState<CompanySettings>({
    companyName: 'KHASKINS (PVT) LTD', ntn: '0709343-8', strn: '12-01-4203-283-46',
    address: 'Plot#179, Sector 7-A, Korangi Industrial Area Karachi - 74900',
    city: 'Karachi', phone: '+92-21-3456-7890', email: 'info@khaskins.pk',
  });

  const [fbrForm, setFbrForm] = useState({ ...fbrSettings });

  const [bankForm, setBankForm] = useState<BankSettings>({
    bankName: '', branchName: '', accountTitle: '',
    accountNumber: '', iban: '', swiftCode: '',
  });

  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  const handleSaveFbr = () => {
    setFbrSettings(fbrForm);
    toast({ title: 'FBR settings saved!' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="fbr">FBR</TabsTrigger>
          <TabsTrigger value="bank">Bank Details</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader><CardTitle>Company Settings</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2"><Label>Company Name</Label><Input value={compForm.companyName} onChange={e => setCompForm({ ...compForm, companyName: e.target.value })} /></div>
              <div className="space-y-2"><Label>NTN</Label><Input value={compForm.ntn} onChange={e => setCompForm({ ...compForm, ntn: e.target.value })} /></div>
              <div className="space-y-2"><Label>STRN</Label><Input value={compForm.strn} onChange={e => setCompForm({ ...compForm, strn: e.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input value={compForm.address} onChange={e => setCompForm({ ...compForm, address: e.target.value })} /></div>
              <div className="space-y-2"><Label>City</Label><Input value={compForm.city} onChange={e => setCompForm({ ...compForm, city: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={compForm.phone} onChange={e => setCompForm({ ...compForm, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={compForm.email} onChange={e => setCompForm({ ...compForm, email: e.target.value })} /></div>
              <div className="sm:col-span-2">
                <Button onClick={() => toast({ title: 'Company settings saved!' })}><Save className="w-4 h-4 mr-2" /> Save Company Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fbr">
          <Card>
            <CardHeader><CardTitle>FBR Digital Invoicing Integration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seller NTN</Label>
                  <Input value={fbrForm.sellerNtn} onChange={e => setFbrForm({ ...fbrForm, sellerNtn: e.target.value })} placeholder="e.g. 0709343" />
                </div>
                <div className="space-y-2">
                  <Label>FBR API Token</Label>
                  <Input value={fbrForm.apiToken} onChange={e => setFbrForm({ ...fbrForm, apiToken: e.target.value })} placeholder="Bearer token" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="fbrMode" checked={fbrForm.mode === 'Sandbox'} onChange={() => setFbrForm({ ...fbrForm, mode: 'Sandbox' })} className="accent-primary" />
                    <span className="text-sm">Sandbox</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="fbrMode" checked={fbrForm.mode === 'Production'} onChange={() => setFbrForm({ ...fbrForm, mode: 'Production' })} className="accent-primary" />
                    <span className="text-sm">Production</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>API URL (auto-set based on mode)</Label>
                <Input value={getFbrApiUrl(fbrForm.mode)} readOnly className="bg-muted text-muted-foreground" />
              </div>
              <Button onClick={handleSaveFbr}><Save className="w-4 h-4 mr-2" /> Save FBR Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Bank Name</Label><Input value={bankForm.bankName} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Branch Name</Label><Input value={bankForm.branchName} onChange={e => setBankForm({ ...bankForm, branchName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Account Title</Label><Input value={bankForm.accountTitle} onChange={e => setBankForm({ ...bankForm, accountTitle: e.target.value })} /></div>
              <div className="space-y-2"><Label>Account Number</Label><Input value={bankForm.accountNumber} onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>IBAN</Label><Input value={bankForm.iban} onChange={e => setBankForm({ ...bankForm, iban: e.target.value })} /></div>
              <div className="space-y-2"><Label>Swift Code</Label><Input value={bankForm.swiftCode} onChange={e => setBankForm({ ...bankForm, swiftCode: e.target.value })} /></div>
              <div className="sm:col-span-2">
                <Button onClick={() => toast({ title: 'Bank details saved!' })}><Save className="w-4 h-4 mr-2" /> Save Bank Details</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-sm">
              <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })} /></div>
              <div className="space-y-2"><Label>New Password</Label><Input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} /></div>
              <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
              <Button onClick={() => {
                if (passwords.new !== passwords.confirm) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
                if (!passwords.old || !passwords.new) { toast({ title: 'All fields required', variant: 'destructive' }); return; }
                toast({ title: 'Password changed!' });
                setPasswords({ old: '', new: '', confirm: '' });
              }}><Save className="w-4 h-4 mr-2" /> Save Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
