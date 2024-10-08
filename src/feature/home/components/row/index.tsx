import Link from "next/link";

type RowType = {
  content: {
    title: string;
    ul: string[];
    url: string;
    button_content: string;
    image: string;
  };
  isEven?: boolean;
};

export const Row = ({ content, isEven = false }: RowType) => {
  return (
    <div className="rounded-3xl mb-5 lg:mb-10 flex lg:flex-row flex-col lg:items-center justify-between p-5 md:p-10 bg-secondary border border-borderColor-DARK shadow-xl w-full overflow-hidden relative z-10">
      {isEven ? (
        <div className="lg:p-5 lg:w-auto w-full">
          <img
            src={content.image}
            className="lg:min-w-[500px] object-cover md:h-[350px] sm:h-[250px] lg:h-[300px] lg:w-auto w-full  shadow-2xl shadow-[rgba(0,0,0,0.3)] border border-borderColor rounded-xl"
          />
        </div>
      ) : null}

      <div
        className={
          isEven ? "lg:ml-[50px]  mt-5 lg:mt-0" : "lg:mr-[50px] mb-5 lg:mb-0"
        }
      >
        <h4 className="text-white font-bold text-xl md:text-2xl lg:text-3xl lg:mb-2">
          {content.title}
        </h4>
        <ul className="text-font-60 text-sm lg:text-lg mt-3 lg:mt-5">
          {content.ul.map((text, i) => (
            <li
              key={i}
              className={`flex relative ${i === 1 ? "my-1.5 lg:my-2" : ""}`}
            >
              <div className="top-[11px] absolute h-1.5 w-1.5 -mb-2 min-w-1.5 mr-2 rounded-full bg-white" />
              <p className="ml-3.5">{text} </p>
            </li>
          ))}
        </ul>
        <button className="text-base_color font-medium text-sm lg:text-lg mt-5 lg:mt-[30px]">
          <Link href={content.url}>{content.button_content}</Link>
        </button>
      </div>
      {!isEven ? (
        <div className="lg:p-5">
          <img
            src={content.image}
            className="lg:min-w-[500px] object-cover h-[300px] lg:w-auto w-full shadow-2xl shadow-[rgba(0,0,0,0.3)] border border-borderColor rounded-xl"
          />
        </div>
      ) : null}
    </div>
  );
};
