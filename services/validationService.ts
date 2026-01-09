import { Individual, InheritanceMode, ValidationIssue, Status, Gender } from '../types';

type FamilyMap = Map<string, Individual>;
type Parents = { father?: Individual; mother?: Individual };

const getParents = (child: Individual, familyMap: FamilyMap): Parents => {
    if (child.parents.length < 2) return {};
    const p1 = familyMap.get(child.parents[0]);
    const p2 = familyMap.get(child.parents[1]);
    if (!p1 || !p2) return {};

    if (p1.gender === Gender.Male && p2.gender === Gender.Female) return { father: p1, mother: p2 };
    if (p1.gender === Gender.Female && p2.gender === Gender.Male) return { father: p2, mother: p1 };
    
    // Cannot determine roles if genders are not explicitly male and female.
    return {};
};

const isAffected = (p?: Individual) => p?.status === Status.Affected;
const isUnaffected = (p?: Individual) => p?.status === Status.Unaffected;

export const validatePedigree = (familyData: Individual[], mode: InheritanceMode): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];
    const familyMap: FamilyMap = new Map(familyData.map(p => [p.id, p]));

    familyData.forEach(person => {
        // --- STRUCTURAL AND DATA INTEGRITY CHECKS ---

        // Check for single parent
        if (person.parents.length === 1) {
            issues.push({ id: person.id, type: 'error', message: `${person.name}: Has only one parent listed. Biological individuals require two.` });
        }
        
        // Check for same-sex parents
        if (person.parents.length === 2) {
            const p1 = familyMap.get(person.parents[0]);
            const p2 = familyMap.get(person.parents[1]);
            if (p1 && p2 && p1.gender !== Gender.Unknown && p1.gender === p2.gender) {
                issues.push({ id: person.id, type: 'error', message: `${person.name}: Parents ${p1.name} and ${p2.name} are both of the same sex.` });
            }
        }

        const { father, mother } = getParents(person, familyMap);
        
        // Parent graphically below child check
        if (father && father.y > person.y) {
            issues.push({ id: father.id, type: 'warning', message: `Structural warning: ${father.name} (parent) is positioned below ${person.name} (child).` });
        }
        if (mother && mother.y > person.y) {
            issues.push({ id: mother.id, type: 'warning', message: `Structural warning: ${mother.name} (parent) is positioned below ${person.name} (child).` });
        }

        // --- MODE-SPECIFIC CHECKS ---

        // Check if a male is a carrier for X-linked traits
        if (person.gender === Gender.Male && person.status === Status.Carrier && mode === InheritanceMode.XL) {
            issues.push({ id: person.id, type: 'error', message: `${person.name}: Males cannot be carriers for X-linked traits.` });
        }

        if (mode === InheritanceMode.YL) {
            if (person.gender === Gender.Female && isAffected(person)) {
                issues.push({ id: person.id, type: 'error', message: `${person.name}: Females cannot be affected by Y-linked traits.` });
            }
            if (person.gender === Gender.Male && person.status === Status.Carrier) {
                issues.push({ id: person.id, type: 'error', message: `${person.name}: Males cannot be carriers for Y-linked traits.` });
            }
            if (person.gender === Gender.Male && father) {
                if (isAffected(person) && isUnaffected(father)) {
                    issues.push({ id: person.id, type: 'error', message: `Affected son ${person.name} has an unaffected father. Impossible for Y-linked.` });
                }
                if (isUnaffected(person) && isAffected(father)) {
                     issues.push({ id: person.id, type: 'error', message: `Unaffected son ${person.name} has an affected father. Impossible for Y-linked.` });
                }
            }
            return; // Skip other checks for this person
        }
        
        // --- GENETIC CHECKS (requires both father and mother) ---
        if (!father || !mother) {
            return; // continue forEach
        }

        switch (mode) {
            case InheritanceMode.AR:
                if (isAffected(person) && isUnaffected(father) && isUnaffected(mother)) {
                    issues.push({ id: person.id, type: 'error', message: `${person.name} is affected, but parents are unaffected non-carriers. Impossible for AR.` });
                }
                if (isAffected(father) && isAffected(mother) && !isAffected(person)) {
                    issues.push({ id: person.id, type: 'error', message: `Unaffected child ${person.name} from two affected parents. Impossible for AR.` });
                }
                break;

            case InheritanceMode.AD:
                if (isAffected(person) && isUnaffected(father) && isUnaffected(mother)) {
                    issues.push({ id: person.id, type: 'error', message: `Affected child ${person.name} from two unaffected parents. Impossible for AD.` });
                }
                break;

            case InheritanceMode.XL:
                 // Male-to-male transmission is not possible for XL traits
                if (isAffected(father) && person.gender === Gender.Male && isAffected(person)) {
                    issues.push({ id: person.id, type: 'error', message: `Affected son ${person.name} cannot inherit an X-linked trait from an affected father.` });
                }
                 // An affected father passes the trait to all daughters in XD
                if (isAffected(father) && person.gender === Gender.Female && isUnaffected(person)) {
                    issues.push({ id: person.id, type: 'warning', message: `Unaffected daughter ${person.name} from an affected father is impossible for X-Dominant inheritance.` });
                }
                 // An affected daughter in XR must have an affected father
                if (person.gender === Gender.Female && isAffected(person) && isUnaffected(father)) {
                    issues.push({ id: person.id, type: 'warning', message: `Affected daughter ${person.name} with an unaffected father is impossible for X-Recessive inheritance.` });
                }
                break;
        }
    });

    return issues;
};