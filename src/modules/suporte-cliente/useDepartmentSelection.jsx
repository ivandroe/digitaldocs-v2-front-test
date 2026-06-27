import { useState, useMemo, useCallback } from 'react';

// ---------------------------------------------------------------------------------------------------------------------

const CLEARED = '__CLEARED__';
const STORAGE_KEY = 'departmentTicket';

function getStoredId() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return undefined;
  if (stored === CLEARED) return null;
  return Number(stored);
}

function persistId(id) {
  if (id === undefined) localStorage.removeItem(STORAGE_KEY);
  else if (id === null) localStorage.setItem(STORAGE_KEY, CLEARED);
  else localStorage.setItem(STORAGE_KEY, String(id));
}

function findInList(list, id) {
  return list?.find(({ department_id, id: _id }) => Number(department_id ?? _id) === Number(id)) ?? null;
}

// ---------------------------------------------------------------------------------------------------------------------

export function useDepartmentSelection({ utilizador, departamentos, isAdmin }) {
  const defaultId = utilizador?.department_id ?? null;
  const [manualId, setManualId] = useState(() => getStoredId());

  const departmentList = useMemo(() => {
    if (isAdmin) return departamentos ?? [];
    const base = { id: utilizador?.department_id, abreviation: utilizador?.department_abreviation };
    return [base, ...(utilizador?.departments ?? [])];
  }, [isAdmin, departamentos, utilizador]);

  const selectedDepartment = useMemo(() => {
    if (!departmentList?.length) return null;

    if (!isAdmin) {
      const effectiveId = manualId ?? defaultId;
      return findInList(departmentList, effectiveId) ?? findInList(departmentList, defaultId) ?? null;
    }

    const effectiveId = manualId === undefined ? defaultId : manualId;
    if (effectiveId === null) return null;
    return findInList(departmentList, effectiveId) ?? null;
  }, [isAdmin, manualId, defaultId, departmentList]);

  const selectedId = selectedDepartment?.department_id ?? selectedDepartment?.id ?? null;

  const setDepartment = useCallback(
    (dep) => {
      const id = dep?.department_id ?? dep?.id ?? null;
      if (!isAdmin && id === null) return;
      persistId(id);
      setManualId(id);
    },
    [isAdmin]
  );

  return { selectedDepartment, selectedId, departmentList, setDepartment };
}
