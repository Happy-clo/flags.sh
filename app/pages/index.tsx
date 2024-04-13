import { useEffect, useState } from "react";
import { Center, Group, Paper, Text, TextInput, Title, Switch, Code, ActionIcon, useMantineColorScheme, Select } from "@mantine/core";
import { InputCaption, Label, MarkedSlider, saveText, SelectDescription, SideBySide } from "@encode42/mantine-extras";
import { IconAlertCircle, IconArchive, IconDownload, IconTool } from "@tabler/icons";
import { Prism } from "@mantine/prism";
import { Layout } from "../core/layout/Layout";
import { PageTitle } from "../core/components/PageTitle";
import { FooterRow } from "../core/components/actionButton/FooterRow";
import { FlagModal } from "../core/components/modal/FlagModal";
import { MemoryModal } from "../core/components/modal/MemoryModal";
import { Flags, FlagType } from "../data/Flags";
import { EnvironmentIcon, Environments, EnvironmentType, getIcon } from "../data/Environments";

// TODO: API
// TODO: 分享按钮
// TODO: 国际化

// BUG: Java标签 -> 启用Pterodactyl -> 应用 -> 禁用Pterodactyl -> 应用 -> GUI仍将被禁用

/**
 * 标志选择器的数据结构。
 */
interface FlagSelector {
    /**
     * 条目的键值。
     */
    "value": string,

    /**
     * 条目的标签。
     */
    "label": string,

    /**
     * 条目的描述。
     */
    "description"?: string
}

interface EnvironmentTab {
    "key": string,
    "label": string,
    "icon": EnvironmentIcon
}

interface HomeProps {
    "environmentTabs": EnvironmentTab[],
    "flagSelectors": FlagSelector[]
}

/**
 * 网站的首页。
 */
function Home({ environmentTabs, flagSelectors }: HomeProps) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";

    const defaultFilename = "server.jar";
    const [filename, setFileName] = useState<string>(defaultFilename);
    const [memory, setMemory] = useState<number>(4);

    const [toggles, setToggles] = useState({
        "gui": false,
        "autoRestart": false,
        "pterodactyl": false,
        "modernVectors": true
    });

    const [result, setResult] = useState<string>("加载中...");

    const [environment, setEnvironment] = useState<EnvironmentType>(Environments.default);
    const [selectedFlags, setSelectedFlags] = useState<FlagType>(Flags.default);
    const [invalidFilename, setInvalidFilename] = useState<boolean | string>(false);

    const [openMemoryModal, setOpenMemoryModal] = useState(false);
    const [openFlagModal, setOpenFlagModal] = useState(false);

    const [disabled, setDisabled] = useState({ ...selectedFlags.disabled, ...environment.disabled });

    // 环境开关变化时
    useEffect(() => {
        if (!environment.requires) {
            return;
        }

        // 遍历每个要求
        for (const [key, value] of Object.entries(environment.requires)) {
            const newDisabled = disabled;

            // 遍历每个排除项
            for (const exclude of value.excludes) {
                // 如果需要，则禁用开关
                if (toggles[exclude]) {
                    newDisabled[key] = true;
                }
            }

            setDisabled(newDisabled);
        }
    }, [toggles, disabled, environment]);

    // 更新禁用组件
    useEffect(() => {
        setDisabled({ ...selectedFlags.disabled, ...environment.disabled });
    }, [environment.disabled, selectedFlags.disabled]);

    // 更改选项时
    useEffect(() => {
        // 获取目标内存
        let targetMem = memory;
        if (!disabled.pterodactyl && toggles.pterodactyl) {
            targetMem = (85 / 100) * targetMem;
        }

        // 创建脚本
        const flags = selectedFlags.result({
            "memory": targetMem,
            "filename": filename.replaceAll(/\s/g, "\\ "),
            "gui": !disabled.gui && toggles.gui,
            "pterodactyl": !disabled.pterodactyl && toggles.pterodactyl,
            "modernVectors": !disabled.modernVectors && toggles.modernVectors
        });
        const script = environment.result({ flags, "autoRestart": toggles.autoRestart });

        setResult(script);
    }, [filename, memory, toggles, selectedFlags, environment, disabled]);

    return (
        <>
            {/* 控制中心 */}
            <Center sx={{
                "height": "100%"
            }}>
                <Paper padding="md" shadow="sm" withBorder sx={theme => ({
                    "width": "100%",
                    "backgroundColor": isDark ? theme.colors.dark[6] : theme.colors.gray[0]
                })}>
                    <Group direction="column" grow>
                        <PageTitle />
                        <Group grow sx={{
                            "alignItems": "flex-start"
                        }}>
                            {/* 左侧选项 */}
                            <Group direction="column" grow>
                                {/* 文件名选择器 */}
                                <InputCaption text="用于启动服务器的文件。位于与您的配置文件相同的目录中。">
                                    <Label label="文件名">
                                        <TextInput defaultValue={defaultFilename} error={invalidFilename} icon={<IconArchive />} onChange={event => {
                                            const value = event.target.value;

                                            // 确保输入有效
                                            if (!value.includes(".jar")) {
                                                setInvalidFilename("文件名必须以 .jar 结尾");
                                            } else {
                                                setInvalidFilename(false);
                                                setFileName(event.target.value);
                                            }
                                        }}/>
                                    </Label>
                                </InputCaption>

                                {/* 内存选择器 */}
                                <Label label="内存" icon={
                                    <ActionIcon size="xs" variant="transparent" onClick={() => {
                                        setOpenMemoryModal(true);
                                    }}>
                                        <IconTool />
                                    </ActionIcon>
                                }>
                                    <MarkedSlider interval={4} step={0.5} min={0.5} max={24} value={memory} thumbLabel="内存分配滑块" label={value => {
                                        return `${value.toFixed(1)} GB`;
                                    }} intervalLabel={value => {
                                        return `${value} GB`;
                                    }} onChange={value => {
                                        setMemory(value);
                                    }}/>
                                </Label>
                            </Group>

                            {/* 右侧选项 */}
                            <Group direction="column" grow>
                                {/* 标志选择器 */}
                                <Label label="标志" icon={
                                    <ActionIcon size="xs" variant="transparent" onClick={() => {
                                        setOpenFlagModal(true);
                                    }}>
                                        <IconTool />
                                    </ActionIcon>
                                }>
                                    <Select value={selectedFlags.key} itemComponent={SelectDescription} styles={theme => ({
                                        "dropdown": {
                                            "background": isDark ? theme.colors.dark[8] : theme.colors.gray[0]
                                        }
                                    })} onChange={value => {
                                        if (!value) {
                                            return;
                                        }

                                        setSelectedFlags(Flags.types[value] ?? selectedFlags);
                                    }} data={flagSelectors} />
                                </Label>

                                {/* 杂项开关 */}
                                <InputCaption text="启用服务器的GUI控制面板。在没有桌面的环境中自动禁用。">
                                    <Switch label="GUI" checked={!disabled.gui && toggles.gui} disabled={disabled.gui} onChange={event => {
                                        setToggles({ ...toggles, "gui": event.target.checked });
                                    }} />
                                </InputCaption>
                                <InputCaption text={`在服务器崩溃或停止后自动重启。按CTRL + C退出脚本。`}>
                                    <Switch label="自动重启" checked={!disabled.autoRestart && toggles.autoRestart} disabled={disabled.autoRestart} onChange={event => {
                                        setToggles({ ...toggles, "autoRestart": event.target.checked });
                                    }} />
                                </InputCaption>
                            </Group>
                        </Group>

                        {/* 结果标志 */}
                        <Label label={<Text size="xl" weight={700}>结果</Text>}>
                            <Prism.Tabs styles={theme => ({
                                "copy": {
                                    "backgroundColor": isDark ? theme.colors.dark[6] : theme.colors.gray[0],
                                    "borderRadius": theme.radius.xs
                                },
                                "line": {
                                    "whiteSpace": "pre-wrap"
                                }
                            })} onTabChange={active => {
                                // 从标签获取选中的类型
                                const key = Object.keys(Environments.types)[active]; // TODO: 这是不可靠的，但tabKey不起作用
                                if (!key) {
                                    return;
                                }

                                // 切换不适用的组件
                                const env = Environments.types[key];
                                if (!env) {
                                    return;
                                }

                                setEnvironment(env);
                            }}>
                                {environmentTabs.map(env => (
                                    <Prism.Tab key={env.key} label={env.label} icon={getIcon(env.icon)} withLineNumbers language="bash">
                                        {result}
                                    </Prism.Tab>
                                ))}
                            </Prism.Tabs>
                        </Label>

                        {/* 底部链接 */}
                        <SideBySide leftSide={
                            <Group noWrap>
                                {/* 下载按钮 */}
                                <ActionIcon color="green" variant="filled" size="lg" title="下载当前脚本" disabled={disabled.download} onClick={() => {
                                    if (environment.file) {
                                        saveText(result, environment.file);
                                    }
                                }}>
                                    <IconDownload />
                                </ActionIcon>

                                {/* 低内存警告 */}
                                <Group spacing="xs" noWrap sx={{
                                    "display": memory < 4 ? "" : "none"
                                }}>
                                    <IconAlertCircle />
                                    <Text sx={{
                                        "whiteSpace": "pre-wrap"
                                    }}>建议至少分配 <Code>4 GB</Code> 内存。</Text>
                                </Group>
                            </Group>
                        } rightSide={
                            /* 杂项链接 */
                            <FooterRow />
                        } />
                    </Group>
                </Paper>
            </Center>

            {/* Modals */}
            <MemoryModal open={{
                "value": openMemoryModal,
                "set": setOpenMemoryModal
            }} defaultMemory={{
                "value": memory,
                "set": setMemory
            }} defaultPterodactyl={{
                "value": !disabled.pterodactyl && toggles.pterodactyl,
                "set": value => {
                    setToggles({ ...toggles, "pterodactyl": value });
                },
                "disabled": disabled.pterodactyl ?? false
            }} />

            <FlagModal open={{
                "value": openFlagModal,
                "set": setOpenFlagModal
            }} defaultModernVectors={{
                "value": !disabled.modernVectors && toggles.modernVectors,
                "set": value => {
                    setToggles({ ...toggles, "modernVectors": value });
                },
                "disabled": disabled.modernVectors ?? false
            }} />

        </>
    );
}

Home.getLayout = page => <Layout>{page}</Layout>;

export function getStaticProps() {
    // Generate environment tabs from environments
    const environmentTabs: EnvironmentTab[] = [];
    for (const [key, value] of Object.entries(Environments.types)) {
        environmentTabs.push({
            "key": key,
            "label": value.label,
            "icon": value.icon
        });
    }

    // Generate flag selector
    const flagSelectors: FlagSelector[] = [];
    for (const value of Object.values(Flags.types)) {
        flagSelectors.push({
            "value": value.key,
            "label": value.label,
            "description": value.description
        });
    }

    return {
        "props": {
            environmentTabs,
            flagSelectors
        }
    };
}

export default Home;
