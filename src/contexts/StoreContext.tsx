import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export interface Pack {
  id: string; // Use barcode as ID
  userId?: string;
  game: string;
  price: number;
  pack: string;
  status: 'Backstock' | 'Active' | 'Sold Out' | 'Missing';
  location: string;
  activatedAt: string;
  totalTickets: number;
  currentTicket: number;
  createdAt?: any;
}

export interface ScratcherBook {
  id: string;
  userId?: string;
  gameNumber: string;
  name: string;
  price: number;
  totalTickets: number;
  createdAt?: any;
  isActive?: boolean;
}

export interface AuditRecord {
  id: string;
  userId?: string;
  date: string;
  employee: string;
  shift: string;
  status: string;
  discrepancies: number;
  salesCalculated: number;
  netDue?: number;
  totalCash?: number;
  details?: {
    packId: string;
    game: string;
    startTicket: number;
    endTicket: number;
    sold: number;
    revenue: number;
  }[];
  shiftId?: string;
  createdAt?: any;
}

export interface Employee {
  id: string;
  userId?: string;
  name: string;
  role: string;
  createdAt?: any;
}

export interface Shift {
  id: string;
  userId?: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime?: string;
  status: 'Active' | 'Completed';
  createdAt?: any;
}

export interface DayClose {
  id: string;
  userId?: string;
  date: string;
  totalShiftSales: number;
  totalNetDue: number;
  overallDayCash: number;
  shiftsCount: number;
  createdAt?: any;
}

interface StoreContextType {
  books: ScratcherBook[];
  addBook: (book: ScratcherBook) => Promise<void>;
  updateBook: (bookId: string, updatedBookFields: Partial<ScratcherBook>) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  packs: Pack[];
  addPack: (pack: Pack) => Promise<void>;
  updatePack: (packId: string, updatedPackFields: Partial<Pack>) => Promise<void>;
  deletePack: (packId: string) => Promise<void>;
  updatePackTicket: (packId: string, newTicketNumber: number) => Promise<void>;
  dailySales: number;
  ticketsSold: number;
  audits: AuditRecord[];
  addAudit: (audit: AuditRecord) => Promise<void>;
  updateAudit: (auditId: string, updatedAudit: Partial<AuditRecord>) => Promise<void>;
  employees: Employee[];
  addEmployee: (employee: Employee) => Promise<void>;
  shifts: Shift[];
  startShift: (shift: Shift) => Promise<void>;
  endShift: (shiftId: string) => Promise<void>;
  activeShift: Shift | null;
  dayCloses: DayClose[];
  addDayClose: (dayClose: DayClose) => Promise<void>;
  deleteDayClose: (dayCloseId: string) => Promise<void>;
}


const StoreContext = createContext<StoreContextType | undefined>(undefined);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, user: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified,
      isAnonymous: user?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<ScratcherBook[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [dailySales, setDailySales] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [dayCloses, setDayCloses] = useState<DayClose[]>([]);

  useEffect(() => {
    if (!user) {
      setPacks([]);
      setAudits([]);
      setEmployees([]);
      setShifts([]);
      setActiveShift(null);
      setDayCloses([]);
      return;
    }

    const unsubs: (() => void)[] = [];

    try {
      const packsRef = collection(db, 'packs');
      const q = query(packsRef, where('userId', '==', user.uid));
      unsubs.push(onSnapshot(q, (snapshot) => {
        const fetchedPacks: Pack[] = [];
        snapshot.forEach((docSnap) => {
          fetchedPacks.push(docSnap.data() as Pack);
        });
        
        let dSales = 0;
        let tSold = 0;
        fetchedPacks.forEach(p => {
           const sold = p.currentTicket;
           tSold += sold;
           dSales += sold * p.price;
        });
        
        // Sorting by activatedAt
        fetchedPacks.sort((a, b) => new Date(b.activatedAt).getTime() - new Date(a.activatedAt).getTime());
        
        setPacks(fetchedPacks);
        setDailySales(dSales);
        setTicketsSold(tSold);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'packs', user);
      }));

      const auditsRef = collection(db, 'audits');
      const qAudits = query(auditsRef, where('userId', '==', user.uid));
      unsubs.push(onSnapshot(qAudits, (snapshot) => {
        const fetchedAudits: AuditRecord[] = [];
        snapshot.forEach((docSnap) => {
          fetchedAudits.push(docSnap.data() as AuditRecord);
        });
        
        // Optionally sort audits
        fetchedAudits.sort((a, b) => {
           const timeA = a.createdAt?.seconds || 0;
           const timeB = b.createdAt?.seconds || 0;
           return timeB - timeA;
        });
        setAudits(fetchedAudits);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'audits', user);
      }));

      const employeesRef = collection(db, 'employees');
      const qEmployees = query(employeesRef, where('userId', '==', user.uid));
      unsubs.push(onSnapshot(qEmployees, (snapshot) => {
        const fetchedEmployees: Employee[] = [];
        snapshot.forEach((docSnap) => {
          fetchedEmployees.push(docSnap.data() as Employee);
        });
        setEmployees(fetchedEmployees);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'employees', user);
      }));

      const shiftsRef = collection(db, 'shifts');
      const qShifts = query(shiftsRef, where('userId', '==', user.uid));
      unsubs.push(onSnapshot(qShifts, (snapshot) => {
        const fetchedShifts: Shift[] = [];
        snapshot.forEach((docSnap) => {
          fetchedShifts.push(docSnap.data() as Shift);
        });
        setShifts(fetchedShifts);
        const active = fetchedShifts.find(s => s.status === 'Active');
        setActiveShift(active || null);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'shifts', user);
      }));

      const dayClosesRef = collection(db, 'day_closes');
      const qDayCloses = query(dayClosesRef, where('userId', '==', user.uid));
      unsubs.push(onSnapshot(qDayCloses, (snapshot) => {
        const fetchedDayCloses: DayClose[] = [];
        snapshot.forEach((docSnap) => {
          fetchedDayCloses.push(docSnap.data() as DayClose);
        });
        
        fetchedDayCloses.sort((a, b) => {
           const timeA = a.createdAt?.seconds || 0;
           const timeB = b.createdAt?.seconds || 0;
           return timeB - timeA;
        });
        setDayCloses(fetchedDayCloses);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'day_closes', user);
      }));

      const booksRef = collection(db, 'books');
      const qBooks = query(booksRef, where('userId', '==', user.uid));
      unsubs.push(onSnapshot(qBooks, (snapshot) => {
        const fetchedBooks: ScratcherBook[] = [];
        snapshot.forEach((docSnap) => {
          fetchedBooks.push(docSnap.data() as ScratcherBook);
        });
        setBooks(fetchedBooks);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'books', user);
      }));

    } catch (e) {
      console.error(e);
    }

    return () => {
      unsubs.forEach(us => us());
    };
  }, [user]);

  const updateAudit = async (auditId: string, updatedAudit: Partial<AuditRecord>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'audits', auditId), { ...updatedAudit }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `audits/${auditId}`, user);
    }
  };

  const addDayClose = async (dayClose: DayClose) => {
    if (!user) return;
    try {
      const enrichedDayClose = {
        ...dayClose,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'day_closes', dayClose.id), enrichedDayClose);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `day_closes/${dayClose.id}`, user);
    }
  };

  const deleteDayClose = async (dayCloseId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'day_closes', dayCloseId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `day_closes/${dayCloseId}`, user);
    }
  };

  const addEmployee = async (employee: Employee) => {
    if (!user) return;
    try {
      const enrichedEmployee = {
        ...employee,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'employees', employee.id), enrichedEmployee);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `employees/${employee.id}`, user);
    }
  };

  const startShift = async (shift: Shift) => {
    if (!user) return;
    try {
      const enrichedShift = {
        ...shift,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'shifts', shift.id), enrichedShift);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `shifts/${shift.id}`, user);
    }
  };

  const endShift = async (shiftId: string) => {
    if (!user) return;
    try {
      const shift = shifts.find(s => s.id === shiftId);
      if (!shift) return;
      const updatedShift = {
        ...shift,
        status: 'Completed' as const,
        endTime: new Date().toISOString()
      };
      delete updatedShift.createdAt;
      await setDoc(doc(db, 'shifts', shiftId), { ...updatedShift }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `shifts/${shiftId}`, user);
    }
  };

  const addPack = async (pack: Pack) => {
    if (!user) return;
    try {
      const enrichedPack = {
        ...pack,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'packs', pack.id), enrichedPack);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `packs/${pack.id}`, user);
    }
  };

  const updatePackTicket = async (packId: string, newTicketNumber: number) => {
    if (!user) return;
    try {
      const pack = packs.find(p => p.id === packId);
      if (!pack) return;

      const updatedPack = {
        ...pack,
        currentTicket: newTicketNumber,
        status: newTicketNumber <= 0 ? 'Sold Out' : 'Active'
      };
      
      // We shouldn't change createdAt
      delete updatedPack.createdAt; 
      // Instead we rely on merge
      await setDoc(doc(db, 'packs', packId), {
         ...updatedPack
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `packs/${packId}`, user);
    }
  };

  const updatePack = async (packId: string, updatedPackFields: Partial<Pack>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'packs', packId), updatedPackFields, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `packs/${packId}`, user);
    }
  };

  const deletePack = async (packId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'packs', packId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `packs/${packId}`, user);
    }
  };

  const addAudit = async (audit: AuditRecord) => {
    if (!user) return;
    try {
      const enrichedAudit = {
        ...audit,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'audits', audit.id), enrichedAudit);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `audits/${audit.id}`, user);
    }
  };

  const addBook = async (book: ScratcherBook) => {
    if (!user) return;
    try {
      const enrichedBook = {
        ...book,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'books', book.id), enrichedBook);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `books/${book.id}`, user);
    }
  };

  const updateBook = async (bookId: string, updatedBookFields: Partial<ScratcherBook>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'books', bookId), updatedBookFields, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `books/${bookId}`, user);
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'books', bookId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `books/${bookId}`, user);
    }
  };

  return (
    <StoreContext.Provider value={{ books, addBook, updateBook, deleteBook, packs, addPack, updatePack, deletePack, updatePackTicket, dailySales, ticketsSold, audits, addAudit, updateAudit, employees, addEmployee, shifts, startShift, endShift, activeShift, dayCloses, addDayClose, deleteDayClose }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

