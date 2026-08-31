import { VStack, HStack, Text, Image, Spacer, Divider } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  padding,
  frame,
  lineLimit,
  containerBackground,
  widgetURL,
  monospacedDigit,
  opacity,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetData, WidgetTone } from "@/lib/widget-data";

// iOS home-screen widget mirroring the home dashboard summary (countdown +
// warnings/agenda/tasks). This file is ONLY ever reached through the iOS-only
// `lib/widget.ios.ts` bridge — never import it from cross-platform code, because
// `@expo/ui/swift-ui` eagerly requires the native ExpoUI module and crashes web.
//
// MODIFICATION LOCALE — les couleurs sont celles de la palette du mariage,
// RECOPIÉES à la main. Ce fichier ne peut pas lire `@/lib/theme` : la directive
// `'widget'` ci-dessous remplace la fonction par une chaîne de son propre code
// source, évaluée nativement dans l'extension — aucun identifiant extérieur ne
// survit. Chaque littéral porte donc en commentaire le jeton qu'il recopie, et
// c'est le seul endroit de l'app où une divergence avec `garden-theme.ts` ne
// peut pas être détectée autrement qu'en relisant les deux fichiers.
//
// IMPORTANT: the `'widget'` directive (babel-preset-expo widgets-plugin) replaces
// the function below with a STRING of its own source, evaluated natively inside
// the widget extension. So the function must be fully self-contained — every
// color/number is inlined as a literal, and it references only the injected
// `@expo/ui/swift-ui` components/modifiers. No outer identifiers, no imported
// constants, no shared helpers (they would be undefined at native eval time).
//
// The three families get genuinely different layouts, not one shrunk-to-fit
// tree — systemSmall/systemMedium are the SAME HEIGHT on iOS (only width
// differs), so systemMedium spends its extra width as a second column instead
// of stacking more rows, while systemLarge (double height) is the only one
// that reads as a real vertical dashboard.

function PlanningWidgetView(props: WidgetData, environment: WidgetEnvironment) {
  "widget";
  const toneColor = (tone: WidgetTone) =>
    tone === "critical" ? "#00916e" /* GP.clay */ : tone === "warning" ? "#85610b" /* GP.mustard */ : tone === "info" ? "#0e6a7a" /* GP.blue */ : "#616f6a" /* GP.mute */;

  // ── Small: compact hero + the single most urgent line ──
  if (environment.widgetFamily === "systemSmall") {
    const line = props.lines[0];
    return (
      <VStack
        alignment="leading"
        spacing={4}
        modifiers={[padding({ all: 14 }), containerBackground("#fffbf8" /* GP.card */, "widget"), widgetURL("fiance://")]}
      >
        {props.daysUntil != null ? (
          <HStack spacing={3} alignment="lastTextBaseline">
            <Text
              modifiers={[
                font({ size: 32, weight: "heavy", design: "rounded" }),
                foregroundStyle("#00916e" /* GP.clay */),
                monospacedDigit(),
              ]}
            >
              {String(props.daysUntil)}
            </Text>
            <Text modifiers={[font({ size: 11, weight: "semibold" }), foregroundStyle("#616f6a" /* GP.mute */)]}>
              {props.dayUnitLabel}
            </Text>
          </HStack>
        ) : (
          <Text modifiers={[font({ size: 18, weight: "bold" }), foregroundStyle("#00916e" /* GP.clay */), lineLimit(2)]}>
            {props.headline}
          </Text>
        )}
        {props.subtitle ? (
          <Text modifiers={[font({ size: 11, weight: "medium" }), foregroundStyle("#11241f" /* GP.ink */), lineLimit(1)]}>
            {props.subtitle}
          </Text>
        ) : null}
        <Spacer />
        {line ? (
          <HStack spacing={6} modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
            <Image systemName={line.icon as never} size={11} color={toneColor(line.tone)} />
            <Text
              modifiers={[
                font({ size: 11 }),
                foregroundStyle("#11241f" /* GP.ink */),
                lineLimit(1),
                frame({ maxWidth: Infinity, alignment: "leading" }),
              ]}
            >
              {line.text}
            </Text>
          </HStack>
        ) : (
          <Text modifiers={[font({ size: 11 }), foregroundStyle("#616f6a" /* GP.mute */)]}>{props.empty}</Text>
        )}
      </VStack>
    );
  }

  // ── Large: full vertical dashboard ──
  if (environment.widgetFamily === "systemLarge") {
    const lines = (props.lines ?? []).slice(0, 7);
    return (
      <VStack
        alignment="leading"
        spacing={8}
        modifiers={[padding({ all: 18 }), containerBackground("#fffbf8" /* GP.card */, "widget"), widgetURL("fiance://")]}
      >
        <HStack modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
          {props.daysUntil != null ? (
            <HStack spacing={5} alignment="lastTextBaseline">
              <Text
                modifiers={[
                  font({ size: 46, weight: "heavy", design: "rounded" }),
                  foregroundStyle("#00916e" /* GP.clay */),
                  monospacedDigit(),
                ]}
              >
                {String(props.daysUntil)}
              </Text>
              <Text modifiers={[font({ size: 14, weight: "semibold" }), foregroundStyle("#616f6a" /* GP.mute */)]}>
                {props.dayUnitLabel}
              </Text>
            </HStack>
          ) : (
            <Text modifiers={[font({ size: 26, weight: "bold" }), foregroundStyle("#00916e" /* GP.clay */), lineLimit(2)]}>
              {props.headline}
            </Text>
          )}
          <Spacer />
          <Image systemName="heart.fill" size={16} color="#00916e" /* GP.clay */ modifiers={[opacity(0.18)]} />
        </HStack>
        {props.subtitle ? (
          <Text modifiers={[font({ size: 14, weight: "medium" }), foregroundStyle("#11241f" /* GP.ink */), lineLimit(1)]}>
            {props.subtitle}
          </Text>
        ) : null}
        {props.dateLabel ? (
          <Text modifiers={[font({ size: 12 }), foregroundStyle("#616f6a" /* GP.mute */), lineLimit(1)]}>{props.dateLabel}</Text>
        ) : null}
        <Divider />
        {lines.length === 0 ? (
          <Text modifiers={[font({ size: 13 }), foregroundStyle("#616f6a" /* GP.mute */)]}>{props.empty}</Text>
        ) : (
          <VStack alignment="leading" spacing={9}>
            {lines.map((line, i) => (
              <HStack key={i} spacing={8} modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
                <Image systemName={line.icon as never} size={13} color={toneColor(line.tone)} />
                <Text
                  modifiers={[
                    font({ size: 13 }),
                    foregroundStyle("#11241f" /* GP.ink */),
                    lineLimit(1),
                    frame({ maxWidth: Infinity, alignment: "leading" }),
                  ]}
                >
                  {line.text}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
        <Spacer />
      </VStack>
    );
  }

  // ── Medium: two columns — hero on the left, top warnings/agenda on the right.
  // systemMedium is the same HEIGHT as systemSmall (only wider), so this spends
  // the extra width as a column instead of trying to stack more rows.
  const lines = (props.lines ?? []).slice(0, 3);
  return (
    <HStack
      spacing={14}
      alignment="center"
      modifiers={[padding({ all: 16 }), containerBackground("#fffbf8" /* GP.card */, "widget"), widgetURL("fiance://")]}
    >
      <VStack alignment="leading" spacing={4} modifiers={[frame({ width: 108, alignment: "leading" })]}>
        {props.daysUntil != null ? (
          <HStack spacing={3} alignment="lastTextBaseline">
            <Text
              modifiers={[
                font({ size: 32, weight: "heavy", design: "rounded" }),
                foregroundStyle("#00916e" /* GP.clay */),
                monospacedDigit(),
              ]}
            >
              {String(props.daysUntil)}
            </Text>
            <Text modifiers={[font({ size: 11, weight: "semibold" }), foregroundStyle("#616f6a" /* GP.mute */)]}>
              {props.dayUnitLabel}
            </Text>
          </HStack>
        ) : (
          <Text modifiers={[font({ size: 18, weight: "bold" }), foregroundStyle("#00916e" /* GP.clay */), lineLimit(2)]}>
            {props.headline}
          </Text>
        )}
        {props.subtitle ? (
          <Text modifiers={[font({ size: 12, weight: "medium" }), foregroundStyle("#11241f" /* GP.ink */), lineLimit(1)]}>
            {props.subtitle}
          </Text>
        ) : null}
        {props.dateLabel ? (
          <Text modifiers={[font({ size: 10 }), foregroundStyle("#616f6a" /* GP.mute */), lineLimit(1)]}>{props.dateLabel}</Text>
        ) : null}
      </VStack>
      <Divider />
      <VStack alignment="leading" spacing={7} modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
        {lines.length === 0 ? (
          <Text modifiers={[font({ size: 12 }), foregroundStyle("#616f6a" /* GP.mute */)]}>{props.empty}</Text>
        ) : (
          lines.map((line, i) => (
            <HStack key={i} spacing={6} modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
              <Image systemName={line.icon as never} size={12} color={toneColor(line.tone)} />
              <Text
                modifiers={[
                  font({ size: 12 }),
                  foregroundStyle("#11241f" /* GP.ink */),
                  lineLimit(1),
                  frame({ maxWidth: Infinity, alignment: "leading" }),
                ]}
              >
                {line.text}
              </Text>
            </HStack>
          ))
        )}
      </VStack>
    </HStack>
  );
}

export const PlanningWidget = createWidget<WidgetData>("PlanningWidget", PlanningWidgetView);
