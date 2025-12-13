import { EmptyDatabaseProps } from "@/shared/types/empty-state";
import { Plus } from "lucide-react";
import { Button } from "../ui";

export function EmptyMeetings({
  onAction,
  actionLabel = "Schedule Meeting",
}: EmptyDatabaseProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className={`rounded-2xl 
              flex items-center justify-center mb-6
              ring-1 ring-gray-100/50
            `}>
        <svg
          width="211"
          height="120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M59.675 1.364H4.186c-1.497 0-2.78 1.176-2.78 2.779v20.625c0 1.496 1.177 2.779 2.78 2.779h55.49c1.496 0 2.78-1.176 2.78-2.779V4.036c-.108-1.496-1.284-2.672-2.78-2.672ZM132.819 1.364H77.33c-1.496 0-2.78 1.176-2.78 2.779v20.625c0 1.496 1.177 2.779 2.78 2.779h55.489c1.497 0 2.78-1.176 2.78-2.779V4.036c0-1.496-1.283-2.672-2.78-2.672ZM205.657 1.364h-53.98c-1.927 0-3.534 1.55-3.534 3.412v35.36c0 1.86 1.607 3.411 3.534 3.411h53.98c1.928 0 3.535-1.55 3.535-3.412V4.775c0-1.963-1.607-3.41-3.535-3.41Z"
            fill="#fff"
            stroke="#7B7B7D"
            stroke-width="1.5"
            stroke-miterlimit="10"></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M51.671 14.5a.5.5 0 0 1-.5.5H12.676a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5H51.17a.5.5 0 0 1 .5.5v1Z"
            fill="#7B7B7D"></path>
          <path
            d="M206.483 55.184h-55.489c-1.497 0-2.78 1.175-2.78 2.778v20.626c0 1.496 1.176 2.778 2.78 2.778h55.489c1.496 0 2.779-1.175 2.779-2.778V57.856c-.106-1.497-1.283-2.672-2.779-2.672Z"
            fill="#fff"
            stroke="#7B7B7D"
            stroke-width="1.5"
            stroke-miterlimit="10"></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M198.479 68.32a.5.5 0 0 1-.5.5h-38.496a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h38.496a.5.5 0 0 1 .5.5v1Z"
            fill="#7B7B7D"></path>
          <path
            d="M131.483 89.184h-55.49c-1.496 0-2.78 1.175-2.78 2.778v20.626c0 1.496 1.177 2.778 2.78 2.778h55.49c1.496 0 2.779-1.175 2.779-2.778V91.856c-.106-1.497-1.283-2.672-2.779-2.672Z"
            fill="#fff"
            stroke="#7B7B7D"
            stroke-width="1.5"
            stroke-miterlimit="10"></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M123.479 102.32a.5.5 0 0 1-.5.5H84.483a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h38.496a.5.5 0 0 1 .5.5v1Z"
            fill="#7B7B7D"></path>
          <path
            d="M59.675 39.183H4.188c-1.497 0-2.78 1.176-2.78 2.779v20.625c0 1.496 1.176 2.779 2.78 2.779h55.489c1.496 0 2.78-1.176 2.78-2.779V41.962c-.108-1.497-1.284-2.779-2.78-2.779Z"
            fill="#fff"
            stroke="#7B7B7D"
            stroke-width="1.5"
            stroke-miterlimit="10"></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M51.671 52.32a.5.5 0 0 1-.5.5H12.676a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5H51.17a.5.5 0 0 1 .5.5v1ZM124.927 14.5a.5.5 0 0 1-.5.5H85.819a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h38.608a.5.5 0 0 1 .5.5v1Z"
            fill="#7B7B7D"></path>
          <path
            d="M132.177 38.189h-53.98c-1.928 0-3.534 1.55-3.534 3.412v35.36c0 1.86 1.606 3.41 3.534 3.41h53.98c1.928 0 3.534-1.55 3.534-3.41V41.6c0-1.861-1.606-3.412-3.534-3.412Z"
            fill="#fff"
            stroke="#7B7B7D"
            stroke-width="1.5"
            stroke-miterlimit="10"></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M124.927 52.042a.5.5 0 0 1-.5.5H85.819a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h38.608a.5.5 0 0 1 .5.5v1ZM110.569 63.492a.5.5 0 0 1-.5.5h-24.25a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h24.25a.5.5 0 0 1 .5.5v1ZM198.407 14.88a.5.5 0 0 1-.5.5H159.3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h38.607a.5.5 0 0 1 .5.5v1ZM184.049 26.33a.5.5 0 0 1-.5.5H159.3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h24.249a.5.5 0 0 1 .5.5v1Z"
            fill="#7B7B7D"></path>
          <path
            d="M60.374 77.002H6.395c-1.927 0-3.534 1.551-3.534 3.412v35.36c0 1.861 1.607 3.411 3.535 3.411h53.98c1.927 0 3.534-1.55 3.534-3.411v-35.36c0-1.964-1.607-3.412-3.535-3.412Z"
            fill="#fff"
            stroke="#7B7B7D"
            stroke-width="1.5"
            stroke-miterlimit="10"></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M53.125 90.519a.5.5 0 0 1-.5.5H14.017a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h38.608a.5.5 0 0 1 .5.5v1ZM38.766 101.969a.5.5 0 0 1-.5.5H14.017a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h24.25a.5.5 0 0 1 .5.5v1Z"
            fill="#7B7B7D"></path>
        </svg>
      </div>

      <div className="max-w-sm mx-auto space-y-3">
        <h3 className={`text-xl font-semibold tracking-tight`}>
          No Meetings Yet
        </h3>
        <p className={`text-sm leading-relaxed`}>
          Here you can manage your meetings.
        </p>
      </div>

      {onAction && (
        <div className="mt-8">
          <Button
            onClick={onAction}
            className="
                  bg-gray-900 hover:bg-gray-800 text-white
                  px-6 py-2.5 rounded-lg font-medium
                  transform transition-all duration-200
                  hover:scale-105 hover:shadow-lg
                  focus:ring-2 focus:ring-gray-900/20
                ">
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
