import DataRefetchIndicator from './DataRefetchIndicator';

interface DataRefetchContainerProps {
  offset?: number;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

function DataRefetchContainer({
  offset = 0,
  isFetching,
  isError,
  refetch,
}: DataRefetchContainerProps) {
  return (
    <div
      className="absolute z-10"
      style={{
        top: `${offset}px`,
        right: `${offset}px`,
      }}
    >
      {isFetching && <DataRefetchIndicator isError={false} />}
      {isError && <DataRefetchIndicator isError onRetry={refetch} />}
    </div>
  );
}

export default DataRefetchContainer;
