import { useTranslation } from 'react-i18next';
import countries from '~/json/countries.json';
import Combobox from '~/modules/ui/combobox';
import CountryFlag from '../country-flag';
import { config } from 'config';

const SelectCountry = ({ listGroup = 'all', onChange }: { listGroup?: 'all' | 'common'; onChange: (value: string) => void }) => {
  const { t } = useTranslation();
  const options = listGroup === 'all' ? getCountries(countries) : getCountries(config.common.countries);

  const renderCountryOption = (option: { value: string; label: string }) => (
    <div className="flex items-center">
      <CountryFlag countryCode={option.value} imgType="png" className="mr-2" />
      {option.label}
    </div>
  );
  return (
    <Combobox
      contentWidthMatchInput={true}
      options={options}
      name="country"
      onChange={onChange}
      placeholder={t('common:placeholder.select_country')}
      searchPlaceholder={t('common:placeholder.search_country')}
      renderOption={renderCountryOption}
    />
  );
};

export default SelectCountry;

const getCountries = (countriesArray: { code: string; name: string }[]) => {
  return countriesArray.map((country) => ({ value: country.code, label: country.name }));
};
