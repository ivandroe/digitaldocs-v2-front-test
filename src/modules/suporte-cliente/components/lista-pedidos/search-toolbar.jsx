// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// utils
import { statusList } from '../../utils';

// ---------------------------------------------------------------------------------------------------------------------

export default function SearchToolbar({ values, setValues, lists }) {
  const { colaborador, status, subject, department, isAdmin } = values;
  const { usersList = [], subjectsList = [], departamentoList = [] } = lists;
  const { setStatus, setColaborador, setSubject, setDepartment } = setValues;

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack direction="row" spacing={1} sx={{ flexGrow: 1, maxWidth: { md: '40%' } }}>
        <SearchFilter
          value={department}
          disabled={!isAdmin}
          label="Departamento"
          dados={departamentoList}
          setValue={setDepartment}
        />
        <SearchFilter value={status} dados={statusList} setValue={setStatus} label="Estado" />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
        <SearchFilter value={subject} dados={subjectsList} setValue={setSubject} label="Assunto" />
        <SearchFilter value={colaborador} dados={usersList} setValue={setColaborador} label="Atribuído a" />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchAvaliacoes({ values, setValues, lists }) {
  const { rating, subject } = values;
  const { setSubject, setRating } = setValues;
  const { ratingList = [], subjectsList = [] } = lists;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <SearchFilter
        value={rating}
        label="Avaliação"
        setValue={setRating}
        sx={{ maxWidth: { xs: 1, sm: 230 } }}
        dados={ratingList?.map(({ rating, label }) => ({ id: rating, label }))}
      />
      <SearchFilter value={subject} dados={subjectsList} setValue={setSubject} label="Assunto" />
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function SearchFilter({ value, dados, setValue, label, ...others }) {
  return (
    <Autocomplete
      fullWidth
      value={value}
      options={dados}
      onChange={(event, newValue) => setValue(newValue)}
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      getOptionLabel={(option) => option?.abreviation || option?.name || option?.label}
      {...others}
    />
  );
}
