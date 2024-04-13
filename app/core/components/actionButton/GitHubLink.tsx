import { SiteDetails } from "../../../util/util";
import { ReactElement } from "react";
import { ActionIcon, Anchor } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons";
import { ActionButtonOptions } from "./interface/ActionButtonOptions";

/**
 * A component that links to the app's GitHub repository.
 */
export function GitHubLink({ filled = false }: ActionButtonOptions): ReactElement {
    return (
        <Anchor href='https://github.com/Happy-clo/flags.sh' target="_self">
            <ActionIcon color="green" size="lg" variant={filled ? "filled" : "hover"} title="Visit the GitHub repository">
                <IconBrandGithub />
            </ActionIcon>
        </Anchor>
    );
}