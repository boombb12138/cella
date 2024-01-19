import { PublicFooter } from '~/components/public-footer';
import { PublicNav } from './public-nav';

export interface PublicPageProps {
  title: string;
  children?: React.ReactNode;
}

const PublicPage = ({ title, children }: PublicPageProps) => (
  <div>
    <PublicNav />
    <div className="container max-w-none px-0">
      <section className="rich-gradient relative py-20 pb-8">
        <h1 className="mt-12 mb-4 max-w-[600px] px-4 mx-auto sm:w-full text-4xl text-center md:text-5xl">{title}</h1>
      </section>

      {children}
    </div>
    <PublicFooter />
  </div>
);

export default PublicPage;
