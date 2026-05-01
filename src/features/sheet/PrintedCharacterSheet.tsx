import type { TFunction } from "i18next";
import type { ChangeEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { sanitiseDigits } from "../../app/ui/numeric-input";
import { normaliseCharacter } from "../../domain/normalise";
import type { Character, Reward, Skill, Virtue } from "../../domain/types";
import {
	CALLINGS,
	HEROIC_CULTURES,
	STANDARD_OF_LIVING,
} from "../../domain/types";
import {
	BLESSING_BY_CULTURE,
	legacyNameToBlessingId,
} from "../../ref-data/blessings";
import { legacyNameToShadowPath, SHADOW_PATHS } from "../../ref-data/callings";
import {
	findCultureForFeature,
	isCallingDistinctiveFeatureId,
	isKnownDistinctiveFeatureId,
	legacyNameToDistinctiveFeatureId,
} from "../../ref-data/distinctive-features";
import {
	callingKey,
	heroicCultureKey,
	standardOfLivingKey,
} from "../../ref-data/labels";
import { PATRONS, patronFallbackName } from "../../ref-data/patrons";
import { legacyNameToRewardId } from "../../ref-data/rewards";
import { legacyNameToVirtueId } from "../../ref-data/virtues";
import { ConditionCheck } from "./ui/ConditionCheck";
import { CornerOrnament } from "./ui/CornerOrnament";
import { Diamond, DiamondLabel, type DiamondSize } from "./ui/Diamond";
import { FavouredCheck } from "./ui/FavouredCheck";
import { PipRow } from "./ui/Pip";
import { TreasureBox } from "./ui/TreasureBox";

type Props = {
	character: Character;
	onChange: (character: Character) => void;
};

const ATTRIBUTE_KEY: Record<Skill["category"], "strength" | "heart" | "wits"> =
	{
		STRENGTH: "strength",
		HEART: "heart",
		WITS: "wits",
	};

const COMBAT_PROFICIENCY_KEY: Record<
	"AXES" | "BOWS" | "SPEARS" | "SWORDS",
	string
> = {
	AXES: "axes",
	BOWS: "bows",
	SPEARS: "spears",
	SWORDS: "swords",
};

const CATEGORY_DERIVED: Record<
	Skill["category"],
	{
		ratingField: "strength" | "heart" | "wits";
		tnField: "tn_strength" | "tn_heart" | "tn_wits";
		derivedKey: "endurance" | "hope" | "parry";
	}
> = {
	STRENGTH: {
		ratingField: "strength",
		tnField: "tn_strength",
		derivedKey: "endurance",
	},
	HEART: { ratingField: "heart", tnField: "tn_heart", derivedKey: "hope" },
	WITS: { ratingField: "wits", tnField: "tn_wits", derivedKey: "parry" },
};

function joinList(values: readonly string[]): string {
	return values.join(", ");
}

function renderDistinctiveFeatureLabel(
	t: TFunction,
	raw: string,
	characterCulture: Character["heroic_culture"],
): string {
	if (isCallingDistinctiveFeatureId(raw)) {
		return t(`ref.distinctiveFeatures.callings.${raw}`);
	}
	if (isKnownDistinctiveFeatureId(raw)) {
		const culture = findCultureForFeature(raw) ?? characterCulture;
		const cultureKey = culture.toLowerCase().replace(/_/g, "-");
		return t(`ref.distinctiveFeatures.cultures.${cultureKey}.${raw}`);
	}
	const legacyId = legacyNameToDistinctiveFeatureId(raw);
	if (legacyId) {
		return renderDistinctiveFeatureLabel(t, legacyId, characterCulture);
	}
	return raw;
}

const SHADOW_PATH_SET = new Set<string>(SHADOW_PATHS);

function renderShadowPathLabel(t: TFunction, raw: string): string {
	if (!raw) return "";
	if (SHADOW_PATH_SET.has(raw)) return t(`ref.shadowPaths.${raw}`);
	const mapped = legacyNameToShadowPath(raw);
	if (mapped) return t(`ref.shadowPaths.${mapped}`);
	return raw;
}

function resolveBlessingId(character: Character): string {
	const stored = character.cultural_blessing;
	if (stored && legacyNameToBlessingId(stored)) {
		return legacyNameToBlessingId(stored) as string;
	}
	if (stored && Object.values(BLESSING_BY_CULTURE).includes(stored as never)) {
		return stored;
	}
	return BLESSING_BY_CULTURE[character.heroic_culture];
}

function splitList(value: string): string[] {
	return value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}

// Belba's worked example stores rewards/virtues with raw English `name`.
// Resolve to a canonical id so we can render the localised label. Legacy
// virtue-rewards (hardiness/confidence/nimbleness) share their slug with
// virtues, so the lookup falls back to ref.virtues.standard for them.
function rewardLabel(t: TFunction, reward: Reward): string {
	const id = reward.id ?? legacyNameToRewardId(reward.name);
	if (!id) return reward.name;
	return t([`ref.rewards.standard.${id}`, `ref.virtues.standard.${id}`], {
		defaultValue: reward.name,
	});
}

function virtueLabel(t: TFunction, virtue: Virtue): string {
	const id = virtue.id ?? legacyNameToVirtueId(virtue.name);
	if (!id) return virtue.name;
	return t(`ref.virtues.standard.${id}`, { defaultValue: virtue.name });
}

export function PrintedCharacterSheet({ character, onChange }: Props) {
	const { t } = useTranslation();

	function update(patch: Partial<Character>) {
		onChange(normaliseCharacter({ ...character, ...patch }));
	}

	function updateSkill(name: string, patch: Partial<Skill>) {
		update({
			skills: character.skills.map((skill) =>
				skill.name === name ? { ...skill, ...patch } : skill,
			),
		});
	}

	function updateProficiency(
		name: "AXES" | "BOWS" | "SPEARS" | "SWORDS",
		rating: number,
	) {
		update({
			combat_proficiencies: character.combat_proficiencies.map((proficiency) =>
				proficiency.name === name ? { ...proficiency, rating } : proficiency,
			),
		});
	}

	function updateAttribute(
		field: "strength" | "heart" | "wits",
		value: number,
	) {
		update({ attributes: { ...character.attributes, [field]: value } });
	}

	const fellowshipScore = character.valour + character.wisdom;
	const totalLoad = character.load;
	const patronValue = PATRONS.some((p) => p.id === character.company_id)
		? character.company_id
		: "";

	return (
		<article
			className="sheet relative w-full max-w-[1500px] mx-auto bg-parchment border-2 border-ink-red shadow-sheet"
			aria-label={t("sheet.aria.sheet-root")}
		>
			<CornerOrnament corner="tl" />
			<CornerOrnament corner="tr" />
			<CornerOrnament corner="bl" />
			<CornerOrnament corner="br" />
			<div className="border border-ink-red p-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
					<div className="flex flex-col gap-6 min-w-0 md:col-span-3">
						<NameCartouche
							value={character.name}
							onChange={(value) => update({ name: value })}
						/>
						<IdentityStrip
							character={character}
							patronValue={patronValue}
							onChange={update}
						/>
						<AttributeClusters
							character={character}
							onUpdateAttribute={updateAttribute}
						/>
						<SkillsSection character={character} updateSkill={updateSkill} />
						<ProfRewardsVirtuesBand
							character={character}
							updateProficiency={updateProficiency}
							update={update}
						/>
						<WarGearArmourBand character={character} />
					</div>
					<RightSidebar
						character={character}
						fellowshipScore={fellowshipScore}
						totalLoad={totalLoad}
						update={update}
					/>
				</div>
			</div>
		</article>
	);
}

// --- Top of sheet ---------------------------------------------------------

function NameCartouche({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	const { t } = useTranslation();
	return (
		<header className="border-2 border-ink-red px-4 pt-2 pb-3 text-center">
			<span className="font-label text-microlabel tracking-eyebrow uppercase text-ink-red">
				{t("sheet.label.name")}
			</span>
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={t("sheet.placeholder.name")}
				aria-label={t("sheet.aria.character-name")}
				className="block w-full bg-transparent border-0 outline-none focus-visible:bg-ink-red/5 text-center font-body italic font-semibold text-3xl sm:text-4xl text-ink-navy placeholder:text-ink-navy/50 placeholder:not-italic"
			/>
		</header>
	);
}

function IdentityStrip({
	character,
	patronValue,
	onChange,
}: {
	character: Character;
	patronValue: string;
	onChange: (patch: Partial<Character>) => void;
}) {
	const { t } = useTranslation();
	return (
		<section className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-4">
			<div className="flex flex-col gap-3">
				<SelectField
					label={t("sheet.label.heroic-culture")}
					value={character.heroic_culture}
					options={HEROIC_CULTURES.map((culture) => ({
						value: culture,
						label: t(heroicCultureKey(culture)),
					}))}
					onChange={(value) =>
						onChange({ heroic_culture: value as Character["heroic_culture"] })
					}
				/>
				<DerivedField
					label={t("sheet.label.cultural-blessing")}
					value={t(`ref.blessings.${resolveBlessingId(character)}`)}
				/>
				<SelectField
					label={t("sheet.label.calling")}
					value={character.calling}
					options={CALLINGS.map((calling) => ({
						value: calling,
						label: t(callingKey(calling)),
					}))}
					onChange={(value) =>
						onChange({ calling: value as Character["calling"] })
					}
				/>
			</div>
			<div className="flex flex-col gap-3">
				<div className="grid grid-cols-[60px_minmax(0,1fr)_auto] gap-3 items-end">
					<NumberField
						label={t("sheet.label.age")}
						value={character.age}
						onChange={(value) => onChange({ age: value })}
					/>
					<SelectField
						label={t("sheet.label.standard-of-living")}
						value={character.standard_of_living}
						options={STANDARD_OF_LIVING.map((value) => ({
							value,
							label: t(standardOfLivingKey(value)),
						}))}
						onChange={(value) =>
							onChange({
								standard_of_living: value as Character["standard_of_living"],
							})
						}
					/>
					<TreasureBox
						value={character.treasure}
						onChange={(value) => onChange({ treasure: value })}
					/>
				</div>
				<SelectField
					label={t("sheet.label.patron")}
					value={patronValue}
					options={[
						{ value: "", label: t("common.dash") },
						...PATRONS.map((p) => ({
							value: p.id,
							label: t(`ref.patrons.${p.id}`),
						})),
					]}
					onChange={(value) => onChange({ company_id: value })}
					displayFallback={patronFallbackName(character.company_id)}
				/>
				<DerivedField
					label={t("sheet.label.shadow-path")}
					value={renderShadowPathLabel(t, character.shadow_path)}
				/>
			</div>
			<div className="flex flex-col gap-3">
				<TextField
					label={t("sheet.label.distinctive-features")}
					value={joinList(
						character.distinctive_features.map((raw) =>
							renderDistinctiveFeatureLabel(t, raw, character.heroic_culture),
						),
					)}
					onChange={(value) =>
						onChange({ distinctive_features: splitList(value) })
					}
					placeholder={t("sheet.placeholder.distinctive-features")}
				/>
				<TextField
					label={t("sheet.label.flaws")}
					value={joinList(character.flaws)}
					onChange={(value) => onChange({ flaws: splitList(value) })}
					placeholder={t("sheet.placeholder.flaws")}
				/>
			</div>
		</section>
	);
}

// --- Attribute clusters ---------------------------------------------------

function AttributeClusters({
	character,
	onUpdateAttribute,
}: {
	character: Character;
	onUpdateAttribute: (
		field: "strength" | "heart" | "wits",
		value: number,
	) => void;
}) {
	const { t } = useTranslation();
	return (
		<section className="grid grid-cols-3 gap-3 place-items-center">
			{(["STRENGTH", "HEART", "WITS"] as const).map((category) => {
				const meta = CATEGORY_DERIVED[category];
				const tn = character.attributes[meta.tnField];
				const rating = character.attributes[meta.ratingField];
				const derived =
					category === "STRENGTH"
						? character.max_endurance
						: category === "HEART"
							? character.max_hope
							: character.effective_parry;
				const attributeKey = ATTRIBUTE_KEY[category];
				return (
					<div key={category} className="flex flex-col items-center gap-5">
						<h3 className="font-display font-bold text-2xl tracking-eyebrow uppercase text-ink-red">
							{t(`sheet.attribute.${attributeKey}`)}
						</h3>
						<AttributeCluster
							tn={tn}
							rating={rating}
							derived={derived}
							derivedLabel={t(`sheet.label.derived.${meta.derivedKey}`)}
							ratingAriaLabel={t(`sheet.aria.${attributeKey}-rating`)}
							onChangeRating={(value) =>
								onUpdateAttribute(meta.ratingField, value)
							}
						/>
					</div>
				);
			})}
		</section>
	);
}

function AttributeCluster({
	tn,
	rating,
	derived,
	derivedLabel,
	ratingAriaLabel,
	onChangeRating,
}: {
	tn: number;
	rating: number;
	derived: number;
	derivedLabel: string;
	ratingAriaLabel: string;
	onChangeRating: (value: number) => void;
}) {
	const { t } = useTranslation();
	return (
		<div
			className="grid items-center"
			style={{
				gridTemplateAreas: `
          ".         centre  rating-diamond   rating-label"
          "tn-label  centre  derived-diamond  derived-label"
        `,
				gridTemplateColumns:
					"auto var(--size-diamond-lg) var(--size-diamond-sm) auto",
				gridTemplateRows: "var(--size-diamond-sm) var(--size-diamond-sm)",
				columnGap: "var(--diamond-gap-vertex-tight)",
				rowGap: "var(--diamond-gap-vertex-cosy)",
			}}
		>
			<DiamondLabel
				className="justify-self-end"
				style={{
					gridArea: "tn-label",
					marginRight: "var(--diamond-gap-vertex-tight)",
				}}
			>
				{t("sheet.label.tn")}
			</DiamondLabel>
			<div style={{ gridArea: "centre" }}>
				<Diamond size="lg">{tn}</Diamond>
			</div>
			<div style={{ gridArea: "rating-diamond" }}>
				<Diamond size="sm">
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={rating}
						onChange={(event) =>
							onChangeRating(sanitiseDigits(event.target.value))
						}
						aria-label={ratingAriaLabel}
						className="w-7 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-body font-semibold tabular-nums text-base text-ink-navy"
					/>
				</Diamond>
			</div>
			<DiamondLabel
				style={{
					gridArea: "rating-label",
					marginLeft: "var(--diamond-gap-vertex-tight)",
				}}
			>
				{t("sheet.label.rating")}
			</DiamondLabel>
			<div style={{ gridArea: "derived-diamond" }}>
				<Diamond size="sm">{derived}</Diamond>
			</div>
			<DiamondLabel
				style={{
					gridArea: "derived-label",
					marginLeft: "var(--diamond-gap-vertex-tight)",
				}}
			>
				{derivedLabel}
			</DiamondLabel>
		</div>
	);
}

// --- Skills ---------------------------------------------------------------

function SkillsSection({
	character,
	updateSkill,
}: {
	character: Character;
	updateSkill: (name: string, patch: Partial<Skill>) => void;
}) {
	const { t } = useTranslation();
	const byCategory = (category: Skill["category"]) =>
		character.skills.filter((skill) => skill.category === category);
	return (
		<section>
			<SectionHeader>{t("sheet.section.skills")}</SectionHeader>
			<div
				className="grid grid-cols-3 gap-x-3 pt-4 divide-x divide-ink-red/30"
				style={{ gridTemplateRows: "repeat(6, minmax(0, 1fr))" }}
			>
				{(["STRENGTH", "HEART", "WITS"] as const).map((category) => (
					<ul
						key={category}
						className="grid grid-rows-subgrid row-span-6 gap-y-1.5 px-3 first:pl-0 last:pr-0 divide-y divide-ink-red/20"
					>
						{byCategory(category).map((skill) => (
							<SkillRow
								key={skill.id ?? skill.name}
								skill={skill}
								updateSkill={updateSkill}
							/>
						))}
					</ul>
				))}
			</div>
		</section>
	);
}

function SkillRow({
	skill,
	updateSkill,
}: {
	skill: Skill;
	updateSkill: (name: string, patch: Partial<Skill>) => void;
}) {
	const { t } = useTranslation();
	const label = skill.id ? t(`ref.skills.${skill.id}`) : skill.name;
	return (
		<li className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-3 py-1">
			<FavouredCheck
				checked={skill.favoured}
				onChange={() => updateSkill(skill.name, { favoured: !skill.favoured })}
				label={label}
			/>
			<span className="font-body text-lg text-ink-navy">{label}</span>
			<PipRow
				rating={skill.rating}
				onChange={(rating) => updateSkill(skill.name, { rating })}
				label={label}
			/>
		</li>
	);
}

// --- Combat / Rewards / Virtues ------------------------------------------

function ProfRewardsVirtuesBand({
	character,
	updateProficiency,
	update,
}: {
	character: Character;
	updateProficiency: (
		name: "AXES" | "BOWS" | "SPEARS" | "SWORDS",
		rating: number,
	) => void;
	update: (patch: Partial<Character>) => void;
}) {
	const { t } = useTranslation();
	return (
		<section className="grid grid-cols-3 gap-3">
			<div>
				<SectionHeader>{t("sheet.section.combat-proficiencies")}</SectionHeader>
				<ul className="flex flex-col pt-4 divide-y divide-ink-red/20">
					{character.combat_proficiencies.map((proficiency) => (
						<li
							key={proficiency.name}
							className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-1"
						>
							<span className="font-body text-lg text-ink-navy">
								{t(
									`sheet.combat-proficiency.${COMBAT_PROFICIENCY_KEY[proficiency.name]}`,
								)}
							</span>
							<PipRow
								rating={proficiency.rating}
								onChange={(rating) =>
									updateProficiency(proficiency.name, rating)
								}
								label={t(
									`sheet.combat-proficiency.${COMBAT_PROFICIENCY_KEY[proficiency.name]}`,
								)}
							/>
						</li>
					))}
				</ul>
			</div>

			<RewardLikeColumn
				title={t("sheet.section.rewards")}
				statLabel={t("sheet.label.valour")}
				statValue={character.valour}
				statMin={1}
				statMax={6}
				onStatChange={(value) => update({ valour: value })}
				items={character.rewards.map((r) => rewardLabel(t, r))}
				emptyMessage={t("sheet.empty.no-rewards")}
			/>
			<RewardLikeColumn
				title={t("sheet.section.virtues")}
				statLabel={t("sheet.label.wisdom")}
				statValue={character.wisdom}
				statMin={1}
				statMax={6}
				onStatChange={(value) => update({ wisdom: value })}
				items={character.virtues.map((v) => virtueLabel(t, v))}
				emptyMessage={t("sheet.empty.no-virtues")}
			/>
		</section>
	);
}

function RewardLikeColumn({
	title,
	statLabel,
	statValue,
	statMin,
	statMax,
	onStatChange,
	items,
	emptyMessage,
}: {
	title: string;
	statLabel: string;
	statValue: number;
	statMin?: number;
	statMax?: number;
	onStatChange: (value: number) => void;
	items: string[];
	emptyMessage: string;
}) {
	return (
		<div>
			<header className="relative grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-ink-red">
				<span className="-mt-2.5 bg-parchment pr-3 font-display font-semibold text-base tracking-label uppercase text-ink-red">
					{title}
				</span>
				<span aria-hidden />
				<div className="-mt-3 bg-parchment pl-2 flex items-center gap-2">
					<DiamondLabel>{statLabel}</DiamondLabel>
					<Diamond size="sm">
						<input
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							value={statValue}
							onChange={(event) =>
								onStatChange(
									sanitiseDigits(event.target.value, {
										min: statMin,
										max: statMax,
									}),
								)
							}
							aria-label={statLabel}
							className="w-7 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-body font-semibold tabular-nums text-base text-ink-navy"
						/>
					</Diamond>
				</div>
			</header>
			<ul className="pt-4 flex flex-col min-h-[96px] divide-y divide-ink-red/20">
				{items.length === 0 && (
					<li className="font-body text-lg text-ink-navy/55 italic">
						{emptyMessage}
					</li>
				)}
				{items.map((label, index) => (
					<li
						key={`${label}-${index}`}
						className="font-body italic text-xl text-ink-navy py-0.5"
					>
						{label}
					</li>
				))}
			</ul>
		</div>
	);
}

// --- Gear band -----------------------------------------------------------

function WarGearArmourBand({ character }: { character: Character }) {
	return (
		<section className="grid grid-cols-1 md:grid-cols-2 gap-3">
			<WarGearPanel character={character} />
			<ArmourPanel character={character} />
		</section>
	);
}

function WarGearPanel({ character }: { character: Character }) {
	const { t } = useTranslation();
	return (
		<div>
			<SectionHeader>{t("sheet.section.war-gear")}</SectionHeader>
			<table className="w-full mt-3 text-left">
				<thead>
					<tr className="font-label text-microcaption tracking-section uppercase text-ink-red/85">
						<th className="pb-1 font-medium">
							{t("sheet.weapon.column.weapon")}
						</th>
						<th className="pb-1 font-medium text-center">
							{t("sheet.weapon.column.damage")}
						</th>
						<th className="pb-1 font-medium text-center">
							{t("sheet.weapon.column.injury")}
						</th>
						<th className="pb-1 font-medium text-center">
							{t("sheet.weapon.column.load")}
						</th>
						<th className="pb-1 font-medium">
							{t("sheet.weapon.column.notes")}
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-ink-red/20">
					{character.war_gear.weapons.length === 0 && (
						<tr>
							<td
								colSpan={5}
								className="font-body text-lg text-ink-navy/55 italic py-2"
							>
								{t("sheet.empty.no-weapons")}
							</td>
						</tr>
					)}
					{character.war_gear.weapons.map((weapon, index) => {
						const label = weapon.id
							? t(`ref.equipment.weapons.${weapon.id}`)
							: weapon.type;
						return (
							<tr key={`${weapon.id ?? weapon.type}-${index}`}>
								<td className="font-body italic text-xl text-ink-navy py-0.5">
									{label}
								</td>
								<td className="font-body tabular-nums text-xl text-ink-navy text-center">
									{t("common.dash")}
								</td>
								<td className="font-body tabular-nums text-xl text-ink-navy text-center">
									{t("common.dash")}
								</td>
								<td className="font-body tabular-nums text-xl text-ink-navy text-center">
									{weapon.load}
								</td>
								<td className="font-body italic text-xl text-ink-navy" />
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

function ArmourPanel({ character }: { character: Character }) {
	const { t } = useTranslation();
	return (
		<div>
			<SectionHeader>{t("sheet.section.armour")}</SectionHeader>
			<div className="mt-3 flex flex-col divide-y divide-ink-red/20">
				<ArmourRow
					label={t("sheet.armour.label.armour")}
					type={
						character.war_gear.armour?.id
							? t(`ref.equipment.armour.${character.war_gear.armour.id}`)
							: (character.war_gear.armour?.type ?? "")
					}
					secondaryLabel={t("sheet.armour.label.protection")}
					secondaryValue=""
					load={character.war_gear.armour?.load}
				/>
				<ArmourRow
					label={t("sheet.armour.label.helm")}
					type={character.war_gear.helm ? t("sheet.armour.helm-name") : ""}
					load={character.war_gear.helm?.load}
				/>
				<ArmourRow
					label={t("sheet.armour.label.shield")}
					type={
						character.war_gear.shield?.id
							? t(`ref.equipment.shields.${character.war_gear.shield.id}`)
							: (character.war_gear.shield?.type ?? "")
					}
					secondaryLabel={t("sheet.armour.label.parry")}
					secondaryValue={
						character.war_gear.shield
							? `+${character.war_gear.shield.parry_bonus}`
							: ""
					}
					load={character.war_gear.shield?.load}
				/>
			</div>
		</div>
	);
}

// --- Right sidebar -------------------------------------------------------

function RightSidebar({
	character,
	fellowshipScore,
	totalLoad,
	update,
}: {
	character: Character;
	fellowshipScore: number;
	totalLoad: number;
	update: (patch: Partial<Character>) => void;
}) {
	return (
		<aside className="flex flex-col gap-5 min-w-0">
			<PortraitFrame />
			<ExperienceTriplet
				character={character}
				fellowshipScore={fellowshipScore}
				update={update}
			/>
			<div className="grid grid-cols-2 gap-3">
				<EnduranceLoadCluster
					character={character}
					totalLoad={totalLoad}
					update={update}
				/>
				<HopeShadowCluster character={character} update={update} />
			</div>
			<ConditionsBlock character={character} update={update} />
			<TravellingGearBlock character={character} update={update} />
		</aside>
	);
}

function PortraitFrame() {
	const { t } = useTranslation();
	return (
		<div className="aspect-square w-full bg-parchment-deep border-2 border-ink-red flex items-center justify-center">
			<span className="font-label text-microlabel tracking-label uppercase text-ink-red/40">
				{t("sheet.label.portrait")}
			</span>
		</div>
	);
}

function ExperienceTriplet({
	character,
	fellowshipScore,
	update,
}: {
	character: Character;
	fellowshipScore: number;
	update: (patch: Partial<Character>) => void;
}) {
	const { t } = useTranslation();
	return (
		<div className="grid grid-cols-3 gap-[var(--diamond-gap-vertex-cosy)]">
			<SidebarStat size="sm" label={t("sheet.label.adventure-points")}>
				<input
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					value={character.experience.adventure_points}
					onChange={(event) =>
						update({
							experience: {
								...character.experience,
								adventure_points: sanitiseDigits(event.target.value),
							},
						})
					}
					aria-label={t("sheet.aria.adventure-points")}
					className="w-9 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-body font-semibold tabular-nums text-xl text-ink-navy"
				/>
			</SidebarStat>
			<SidebarStat size="sm" label={t("sheet.label.skill-points")}>
				<input
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					value={character.experience.skill_points}
					onChange={(event) =>
						update({
							experience: {
								...character.experience,
								skill_points: sanitiseDigits(event.target.value),
							},
						})
					}
					aria-label={t("sheet.aria.skill-points")}
					className="w-9 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-body font-semibold tabular-nums text-xl text-ink-navy"
				/>
			</SidebarStat>
			<SidebarStat size="sm" label={t("sheet.label.fellowship-score")}>
				{fellowshipScore}
			</SidebarStat>
		</div>
	);
}

function SidebarStat({
	label,
	children,
	size = "md",
}: {
	label: ReactNode;
	children: ReactNode;
	size?: DiamondSize;
}) {
	return (
		<div className="flex flex-col items-center gap-2 min-w-0">
			<span className="font-label text-microline tracking-label uppercase text-ink-red text-center min-h-[2lh]">
				{label}
			</span>
			<Diamond size={size}>{children}</Diamond>
		</div>
	);
}

/**
 * Sidebar cluster: one large diamond on the left, two smaller stacked
 * diamonds on the right. The cluster's section title (e.g. "Resistência Atual")
 * is rendered by the consumer above this grid; the small `topLabel`
 * sits above the top diamond in the cluster, and `bottomLabel` spans both
 * columns below so long captions ("Cicatriz") get room to breathe.
 */
function SidebarCluster({
	primary,
	top,
	topLabel,
	bottom,
	bottomLabel,
}: {
	primary: ReactNode;
	top: ReactNode;
	topLabel: ReactNode;
	bottom: ReactNode;
	bottomLabel: ReactNode;
}) {
	return (
		<div
			className="grid"
			style={{
				gridTemplateAreas: `
          ".              top-label"
          "primary        top"
          "primary        bottom"
          "bottom-label   bottom-label"
        `,
				gridTemplateColumns: "min-content min-content",
				gridTemplateRows:
					"auto var(--size-diamond-sm) var(--size-diamond-sm) auto",
				columnGap: "var(--diamond-gap-vertex-tight)",
				rowGap: "var(--diamond-gap-vertex-cosy)",
				alignItems: "center",
			}}
		>
			<DiamondLabel
				className="self-end justify-self-center text-center"
				style={{
					gridArea: "top-label",
					marginBottom: "var(--diamond-gap-vertex-tight)",
					whiteSpace: "normal",
				}}
			>
				{topLabel}
			</DiamondLabel>
			<div className="justify-self-end" style={{ gridArea: "primary" }}>
				{primary}
			</div>
			<div className="justify-self-start" style={{ gridArea: "top" }}>
				{top}
			</div>
			<div className="justify-self-start" style={{ gridArea: "bottom" }}>
				{bottom}
			</div>
			<DiamondLabel
				className="self-start justify-self-center text-center"
				style={{
					gridArea: "bottom-label",
					marginTop: "var(--diamond-gap-vertex-tight)",
					whiteSpace: "normal",
				}}
			>
				{bottomLabel}
			</DiamondLabel>
		</div>
	);
}

function EnduranceLoadCluster({
	character,
	totalLoad,
	update,
}: {
	character: Character;
	totalLoad: number;
	update: (patch: Partial<Character>) => void;
}) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col items-center gap-3">
			<h3 className="font-display font-bold text-xl tracking-eyebrow uppercase text-ink-red text-center">
				{t("sheet.label.current-endurance")}
			</h3>
			<SidebarCluster
				primary={
				<Diamond size="md">
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={character.current_endurance}
						onChange={(event) =>
							update({ current_endurance: sanitiseDigits(event.target.value) })
						}
						aria-label={t("sheet.aria.current-endurance")}
						className="w-10 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-body font-semibold tabular-nums text-xl text-ink-navy"
					/>
				</Diamond>
			}
				topLabel={t("sheet.label.load")}
				top={<Diamond size="sm">{totalLoad}</Diamond>}
				bottomLabel={t("sheet.label.fatigue")}
				bottom={
					<Diamond size="sm">
						<input
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							value={character.fatigue}
							onChange={(event) =>
								update({ fatigue: sanitiseDigits(event.target.value) })
							}
							aria-label={t("sheet.aria.fatigue")}
							className="w-7 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-body font-semibold tabular-nums text-base text-ink-navy"
						/>
					</Diamond>
				}
			/>
		</div>
	);
}

function HopeShadowCluster({
	character,
	update,
}: {
	character: Character;
	update: (patch: Partial<Character>) => void;
}) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col items-center gap-3">
			<h3 className="font-display font-bold text-xl tracking-eyebrow uppercase text-ink-red text-center">
				{t("sheet.label.current-hope")}
			</h3>
			<SidebarCluster
				primary={
				<Diamond size="md">
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={character.current_hope}
						onChange={(event) =>
							update({ current_hope: sanitiseDigits(event.target.value) })
						}
						aria-label={t("sheet.aria.current-hope")}
						className="w-10 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-body font-semibold tabular-nums text-xl text-ink-navy"
					/>
				</Diamond>
			}
			topLabel={t("sheet.label.shadow")}
			top={
				<Diamond size="sm">
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={character.shadow}
						onChange={(event) =>
							update({ shadow: sanitiseDigits(event.target.value) })
						}
						aria-label={t("sheet.aria.shadow")}
						className="w-7 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-body font-semibold tabular-nums text-base text-ink-navy"
					/>
				</Diamond>
			}
			bottomLabel={t("sheet.label.shadow-scars")}
			bottom={
				<Diamond size="sm">
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={character.shadow_scars}
						onChange={(event) =>
							update({ shadow_scars: sanitiseDigits(event.target.value) })
						}
						aria-label={t("sheet.aria.shadow-scars")}
						className="w-7 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-body font-semibold tabular-nums text-base text-ink-navy"
					/>
				</Diamond>
			}
			/>
		</div>
	);
}

function ConditionsBlock({
	character,
	update,
}: {
	character: Character;
	update: (patch: Partial<Character>) => void;
}) {
	const { t } = useTranslation();
	return (
		<div>
			<SectionHeader>{t("sheet.section.conditions")}</SectionHeader>
			<div className="pt-4 flex flex-col gap-2">
				<ConditionCheck
					checked={character.conditions.weary}
					label={t("sheet.condition.weary")}
					readOnly
				/>
				<ConditionCheck
					checked={character.conditions.miserable}
					label={t("sheet.condition.miserable")}
					readOnly
				/>
				<ConditionCheck
					checked={character.conditions.wounded}
					label={t("sheet.condition.wounded")}
					onChange={() =>
						update({
							conditions: {
								...character.conditions,
								wounded: !character.conditions.wounded,
							},
						})
					}
				/>
				<div className="pt-2">
					<TextField
						label={t("sheet.wound.label")}
						value={character.wound}
						onChange={(value) => update({ wound: value })}
						placeholder={t("sheet.wound.placeholder")}
						ariaLabel={t("sheet.wound.aria")}
						disabled={!character.conditions.wounded}
					/>
				</div>
			</div>
		</div>
	);
}

function TravellingGearBlock({
	character,
	update,
}: {
	character: Character;
	update: (patch: Partial<Character>) => void;
}) {
	const { t } = useTranslation();
	return (
		<div>
			<SectionHeader>{t("sheet.section.travelling-gear")}</SectionHeader>
			<textarea
				value={character.travelling_gear.join("\n")}
				onChange={(event) =>
					update({
						travelling_gear: event.target.value
							.split("\n")
							.map((item) => item.trim())
							.filter(Boolean),
					})
				}
				rows={4}
				placeholder={t("sheet.placeholder.travelling-gear")}
				aria-label={t("sheet.aria.travelling-gear")}
				className="w-full mt-2 bg-transparent border-0 outline-none focus-visible:bg-ink-red/5 font-body italic text-lg text-ink-navy resize-none placeholder:text-ink-navy/50 placeholder:not-italic"
			/>
		</div>
	);
}

// --- Shared bits ---------------------------------------------------------

function SectionHeader({ children }: { children: ReactNode }) {
	return (
		<header className="relative border-t border-ink-red flex items-center justify-center -mt-2">
			<h3 className="bg-parchment px-3 font-display font-semibold text-base sm:text-lg tracking-label uppercase text-ink-red">
				{children}
			</h3>
		</header>
	);
}

type TextFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	ariaLabel?: string;
};

function TextField({ label, value, onChange, placeholder, disabled, ariaLabel }: TextFieldProps) {
	return (
		<label className="flex flex-col gap-1 min-w-0">
			<span className="font-label text-microcaption tracking-label uppercase text-ink-red">
				{label}
			</span>
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				aria-label={ariaLabel}
				className="w-full bg-transparent border-0 border-b border-ink-red/60 outline-none font-body italic text-2xl text-ink-navy pb-0.5 placeholder:text-ink-navy/50 placeholder:not-italic focus:border-ink-red focus-visible:bg-ink-red/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			/>
		</label>
	);
}

function DerivedField({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-1 min-w-0">
			<span className="font-label text-microcaption tracking-label uppercase text-ink-red">
				{label}
			</span>
			<output className="w-full bg-transparent border-0 border-b border-ink-red/30 font-body italic text-2xl text-ink-navy pb-0.5">
				{value}
			</output>
		</div>
	);
}

type NumberFieldProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
	return (
		<label className="flex flex-col gap-1 min-w-0">
			<span className="font-label text-microcaption tracking-label uppercase text-ink-red">
				{label}
			</span>
			<input
				type="text"
				inputMode="numeric"
				pattern="[0-9]*"
				value={value}
				onChange={(event) => onChange(sanitiseDigits(event.target.value))}
				className="w-full bg-transparent border-0 border-b border-ink-red/60 outline-none font-body font-semibold tabular-nums text-2xl text-ink-navy pb-0.5 focus:border-ink-red transition-colors"
			/>
		</label>
	);
}

type SelectFieldProps = {
	label: string;
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
	displayFallback?: string;
};

function SelectField({
	label,
	value,
	options,
	onChange,
	displayFallback,
}: SelectFieldProps) {
	const { t } = useTranslation();
	const handleChange = (event: ChangeEvent<HTMLSelectElement>) =>
		onChange(event.target.value);
	const matched = options.some((option) => option.value === value);
	const effectiveValue = matched ? value : "";
	return (
		<label className="flex flex-col gap-1 min-w-0">
			<span className="font-label text-microcaption tracking-label uppercase text-ink-red">
				{label}
			</span>
			<div className="relative">
				<select
					value={effectiveValue}
					onChange={handleChange}
					className="w-full bg-transparent border-0 border-b border-ink-red/60 outline-none font-body italic text-2xl text-ink-navy pb-0.5 appearance-none cursor-pointer pr-6 focus:border-ink-red focus-visible:bg-ink-red/5 transition-colors"
				>
					{!matched && (
						<option value="">{displayFallback || t("common.dash")}</option>
					)}
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					width="12"
					height="12"
					className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ink-red/70"
				>
					<path
						d="M3 6 L8 11 L13 6"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
		</label>
	);
}

type ArmourRowProps = {
	label: string;
	type: string;
	secondaryLabel?: string;
	secondaryValue?: string;
	load?: number;
};

function ArmourRow({
	label,
	type,
	secondaryLabel,
	secondaryValue,
	load,
}: ArmourRowProps) {
	const { t } = useTranslation();
	return (
		<div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-3 py-1">
			<div className="flex flex-col min-w-0">
				<span className="font-label text-microcaption tracking-label uppercase text-ink-red">
					{label}
				</span>
				<span className="font-body italic text-xl text-ink-navy truncate min-h-[1.5rem]">
					{type || ""}
				</span>
			</div>
			<div className="flex flex-col items-center min-w-[64px]">
				<span className="font-label text-microcaption tracking-label uppercase text-ink-red">
					{secondaryLabel ?? ""}
				</span>
				<span className="font-body tabular-nums text-xl text-ink-navy min-h-[1.5rem]">
					{secondaryValue ?? ""}
				</span>
			</div>
			<div className="flex flex-col items-center min-w-[44px]">
				<span className="font-label text-microcaption tracking-label uppercase text-ink-red">
					{t("sheet.label.load")}
				</span>
				<span className="font-body tabular-nums text-xl text-ink-navy min-h-[1.5rem]">
					{load !== undefined ? load : ""}
				</span>
			</div>
		</div>
	);
}
