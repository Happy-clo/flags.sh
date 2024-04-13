import { SiteDetails } from "../util/util";
import { Center, Paper, Title, Text, useMantineColorScheme, Group, Anchor, Code } from "@mantine/core";
import { SideBySide } from "@encode42/mantine-extras";
import { Layout } from "../core/layout/Layout";
import { PageTitle } from "../core/components/PageTitle";
import { FooterRow } from "../core/components/actionButton/FooterRow";
import { HomeLink } from "../core/components/actionButton/HomeLink";
import { Link, Routes } from "blitz";

/**
 * 网站的关于页面。
 */
function About() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <>
            <Center sx={{
                "height": "100%"
            }}>
                <Paper padding="md" shadow="sm" withBorder sx={theme => ({
                    "width": "100%",
                    "backgroundColor": isDark ? theme.colors.dark[6] : theme.colors.gray[0]
                })}>
                    <Group direction="column" grow>
                        <PageTitle />

                        <Group direction="column">
                            <Group direction="column" spacing="xs">
                                <Title order={2}>关于</Title>
                                <Text>{SiteDetails.title} 为您的Minecraft Java版服务器生成启动脚本。</Text>
                                <Text>它功能简单易用，提供多种优化标志和预设脚本！</Text>
                            </Group>
                            <Group direction="column" spacing="xs">
                                <Title order={2}>支持</Title>
                                <Text>如何使用本站：</Text>
                                <Text>
                                    在<Link href={Routes.Home()} passHref><Anchor>首页</Anchor></Link>，输入您的服务器jar文件名。
                                    这个jar文件应位于您的Minecraft服务器的根目录，那里有所有的配置文件。
                                    如果您还没下载服务器jar，可以查看 <Anchor href="https://papermc.io" target="_blank">Paper</Anchor> 或 <Anchor href="https://purpurmc.org" target="_blank">Purpur</Anchor>!
                                </Text>
                                <Text>
                                    使用滑块输入要分配给服务器的内存量。确保这个值至少比您可用内存少 <Code>2 GB</Code>，以便为操作系统和其他应用程序留出空间。
                                    例如，如果您的机器有 <Code>8 GB</Code> 内存，最多给服务器 <Code>6 GB</Code>。
                                </Text>
                                <Text>
                                    按您的喜好自定义脚本。您可以切换服务器的GUI，更改使用的标志等。默认设置对大多数使用场景已足够好。
                                </Text>
                                <Text>
                                    本项目是依据 <Anchor href="https://github.com/encode42/flags.sh" target="_blank">encode42/flags.sh</Anchor> 的中文汉化版本创建的，并已征得原作者同意，感谢原作者！
                                </Text>
                                <Text>
                                    最后，执行生成的脚本！您可以从结果窗口复制脚本，或点击下载按钮获取准备就绪的脚本。
                                </Text>
                            </Group>
                        </Group>

                        <SideBySide leftSide={
                            <HomeLink filled />
                        } rightSide={
                            <FooterRow />
                        } />
                    </Group>
                </Paper>
            </Center>
        </>
    );
}

About.getLayout = page => <Layout title="关于">{page}</Layout>;

export default About;